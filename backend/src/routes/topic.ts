import { Hono } from 'hono';
import type { TopicSearchRequest, TopicSearchResponse, Candidate } from '../types';
import { createMemoryClient } from '../lib/memory';
import { rankByTopicScore, extractKeywords } from '../lib/scoring';
import { batchCheckBioAlignment } from '../lib/gemini';

const topic = new Hono();

topic.post('/search', async (c) => {
  try {
    const body = await c.req.json<TopicSearchRequest>();

    // Validate request body
    if (!body.seeds || !body.seeds.farcaster || body.seeds.farcaster.length === 0) {
      return c.json<TopicSearchResponse>(
        {
          success: false,
          message: 'Seeds with farcaster array is required',
        },
        400
      );
    }

    if (!body.topic || body.topic.trim() === '') {
      return c.json<TopicSearchResponse>(
        {
          success: false,
          message: 'Topic is required',
        },
        400
      );
    }

    console.log('🔍 Starting topic search:', {
      seeds: body.seeds.farcaster,
      topic: body.topic,
    });

    // Initialize Memory Protocol client
    const memClient = createMemoryClient();

    // Extract keywords from topic
    const keywords = extractKeywords(body.topic);
    console.log('📝 Extracted keywords:', keywords);

    // Default thresholds and caps
    const thresholds = body.thresholds || { minSeedFollows: 2, minScore: 0.6 };
    const caps = body.caps || { maxSeedFollowersPerSeed: 2000, hydrateTopK: 300 };

    // Step 1: Build candidate pool from Farcaster seeds with full profile data
    const pool = new Map<string, { profile: any; seedCount: number }>();

    for (const seed of body.seeds.farcaster) {
      try {
        console.log(`📡 Fetching followers for seed: ${seed}`);
        const followers = await memClient.getAllFollowers(seed, caps.maxSeedFollowersPerSeed);
        
        console.log(`✅ Found ${followers.length} followers for ${seed}`);

        for (const follower of followers) {
          const fid = follower.id;
          if (!fid) continue;

          const existing = pool.get(fid);
          if (existing) {
            existing.seedCount += 1;
          } else {
            pool.set(fid, { profile: follower, seedCount: 1 });
          }
        }
      } catch (error) {
        console.error(`❌ Error fetching followers for ${seed}:`, error);
        // Continue with other seeds
      }
    }

    console.log(`🎯 Total unique candidates in pool: ${pool.size}`);

    // Step 2: Sort by seed overlap and take top K
    const topCandidates = [...pool.values()]
      .sort((a, b) => b.seedCount - a.seedCount)
      .slice(0, caps.hydrateTopK);

    console.log(`🔝 Filtering top ${topCandidates.length} candidates with Gemini AI`);

    // Step 3: AI-powered bio filtering
    const candidatesForAI = topCandidates.map(c => ({
      id: c.profile.id,
      bio: c.profile.bio || '',
    }));

    const bioAlignmentResults = await batchCheckBioAlignment(candidatesForAI, body.topic, 10);
    
    const aiFilteredCandidates = topCandidates.filter(c => {
      const alignment = bioAlignmentResults.get(c.profile.id);
      return alignment?.aligned === true;
    });

    console.log(`✅ ${aiFilteredCandidates.length}/${topCandidates.length} candidates passed AI bio filter`);

    // Step 4: Score candidates (profile data already available)
    const scoredCandidates: Candidate[] = [];

    for (const candidate of aiFilteredCandidates) {
      try {
        const profile = candidate.profile;

        // Score the candidate
        const scored = rankByTopicScore(
          {
            seedCount: candidate.seedCount,
            bio: profile.bio || '',
            fcFollowers: profile.followersCount || 0,
            keywords,
            negative: body.negative || [],
          },
          thresholds
        );

        if (scored.passes) {
          scoredCandidates.push({
            fid: parseInt(profile.id),
            username: profile.username,
            displayName: profile.displayName,
            bio: profile.bio,
            pfpUrl: profile.avatarUrl,
            score: scored.score,
            why: scored.why,
          });
        }
      } catch (error) {
        console.error(`❌ Error scoring candidate:`, error);
        // Continue with other candidates
      }
    }

    // Step 5: Sort by score and return top 50
    scoredCandidates.sort((a, b) => b.score - a.score);
    const finalCandidates = scoredCandidates.slice(0, 50);

    console.log(`✨ Returning ${finalCandidates.length} qualified candidates`);

    return c.json<TopicSearchResponse>({
      success: true,
      message: `Found ${finalCandidates.length} candidates matching topic`,
      candidates: finalCandidates,
      metadata: {
        totalCandidates: pool.size,
        seedsUsed: body.seeds.farcaster,
        topicKeywords: keywords,
      },
    });
  } catch (error) {
    console.error('❌ Error processing topic search:', error);
    return c.json<TopicSearchResponse>(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      500
    );
  }
});

export default topic;
