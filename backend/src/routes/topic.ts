import { Hono } from 'hono';
import type { TopicSearchRequest, TopicSearchResponse, Candidate } from '../types';
import { createMemoryClient } from '../lib/memory';
import { rankByTopicScore, extractKeywords } from '../lib/scoring';
import { batchCheckBioAlignment, generateNegativeKeywords } from '../lib/gemini';

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

    // Generate negative keywords using Gemini if not provided
    let negativeKeywords = body.negative || [];
    if (negativeKeywords.length === 0) {
      console.log('🤖 Generating negative keywords using Gemini...');
      negativeKeywords = await generateNegativeKeywords(body.topic);
    } else {
      console.log('🚫 Using provided negative keywords:', negativeKeywords);
    }

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

    // Step 2: Filter by minimum seed follows FIRST, then sort and take top K
    const minSeedFollowsFilter = thresholds.minSeedFollows || 1;
    const filteredBySeeds = [...pool.values()].filter(c => c.seedCount >= minSeedFollowsFilter);
    
    console.log(`🔍 Filtered by minSeedFollows (${minSeedFollowsFilter}): ${filteredBySeeds.length}/${pool.size} candidates`);
    
    const topCandidates = filteredBySeeds
      .sort((a, b) => b.seedCount - a.seedCount)
      .slice(0, caps.hydrateTopK);

    console.log(`🔝 Top ${topCandidates.length} candidates selected for Gemini AI filtering`);

    // Step 3: AI-powered bio filtering with username
    const candidatesForAI = topCandidates.map(c => ({
      id: c.profile.id,
      bio: c.profile.bio || '',
      username: c.profile.username || '',
    }));

    const bioAlignmentResults = await batchCheckBioAlignment(candidatesForAI, body.topic, negativeKeywords);
    
    const aiFilteredCandidates = topCandidates.filter(c => {
      const alignment = bioAlignmentResults.get(c.profile.id);
      return alignment?.aligned === true;
    });

    console.log(`✅ ${aiFilteredCandidates.length}/${topCandidates.length} candidates passed AI bio filter`);

    // Step 4: Score candidates (profile data already available)
    const scoredCandidates: Candidate[] = [];
    let failedCount = 0;

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
            negative: negativeKeywords,
          },
          thresholds
        );

        const candidateData = {
          fid: parseInt(profile.id),
          username: profile.username,
          displayName: profile.displayName,
          bio: profile.bio,
          pfpUrl: profile.avatarUrl,
          score: scored.score,
          why: scored.why,
        };

        if (scored.passes) {
          scoredCandidates.push(candidateData);
        } else {
          failedCount++;
          if (failedCount <= 3) {
            console.log(`❌ Candidate failed: @${profile.username} - Score: ${scored.score.toFixed(2)}, Seeds: ${scored.why.seeds}, Keyword: ${scored.why.keywordScore.toFixed(2)}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error scoring candidate:`, error);
        // Continue with other candidates
      }
    }

    console.log(`📊 Scoring results: ${scoredCandidates.length} passed, ${failedCount} failed (threshold: ${thresholds.minScore}, minSeeds: ${thresholds.minSeedFollows})`);

    // Step 5: Sort by score and return top 50
    scoredCandidates.sort((a, b) => b.score - a.score);
    let finalCandidates = scoredCandidates.slice(0, 50);

    // Always return minimum 2 candidates even if they don't meet thresholds
    if (finalCandidates.length < 2 && aiFilteredCandidates.length >= 2) {
      console.log(`⚠️ Only ${finalCandidates.length} candidates passed thresholds, adding top 2 by score...`);
      
      // Get all candidates with scores (even those that failed thresholds)
      const allScoredCandidates: Candidate[] = [];
      for (const candidate of aiFilteredCandidates.slice(0, 10)) {
        try {
          const profile = candidate.profile;
          const scored = rankByTopicScore(
            {
              seedCount: candidate.seedCount,
              bio: profile.bio || '',
              fcFollowers: profile.followersCount || 0,
              keywords,
              negative: negativeKeywords,
            },
            thresholds
          );

          allScoredCandidates.push({
            fid: parseInt(profile.id),
            username: profile.username,
            displayName: profile.displayName,
            bio: profile.bio,
            pfpUrl: profile.avatarUrl,
            score: scored.score,
            why: scored.why,
          });
        } catch (error) {
          // Skip on error
        }
      }

      allScoredCandidates.sort((a, b) => b.score - a.score);
      finalCandidates = allScoredCandidates.slice(0, 2);
      console.log(`✅ Returning top 2 candidates by score (may not meet thresholds)`);
    }

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
