/**
 * Scoring utilities for ranking Farcaster candidates by topic relevance
 */

interface ScoringInput {
  seedCount: number;
  bio: string;
  fcFollowers: number;
  keywords: string[];
  negative: string[];
}

interface ScoringResult {
  score: number;
  passes: boolean;
  why: {
    seeds: number;
    keywordScore: number;
    credibility: number;
    followers: number;
  };
}

/**
 * Calculate keyword match score from bio text
 */
function keywordScore(bio: string, keywords: string[], negative: string[]): number {
  const bioLower = bio.toLowerCase();
  
  // Check for negative keywords (disqualify if found)
  for (const neg of negative) {
    if (bioLower.includes(neg.toLowerCase())) {
      return 0;
    }
  }
  
  // Count keyword matches
  let matches = 0;
  for (const kw of keywords) {
    if (bioLower.includes(kw.toLowerCase())) {
      matches++;
    }
  }
  
  // Normalize by keyword count
  return keywords.length > 0 ? Math.min(1, matches / keywords.length) : 0.5;
}

/**
 * Extract keywords from topic string
 */
export function extractKeywords(topic: string): string[] {
  // Remove common stop words and extract meaningful terms
  const stopWords = new Set(['in', 'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'for', 'with', 'on', 'at']);
  
  return topic
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .map(word => word.replace(/[^\w]/g, ''));
}

/**
 * Rank a candidate by topic relevance score
 */
export function rankByTopicScore(input: ScoringInput, thresholds: { minSeedFollows: number; minScore: number }): ScoringResult {
  // 1. Seed overlap score (0..1)
  // Normalize by expected minimum (e.g., 5 seeds = perfect)
  const seedOverlap = Math.min(1, input.seedCount / 5);
  
  // 2. Keyword match score (0..1)
  const kw = keywordScore(input.bio, input.keywords, input.negative);
  
  // 3. Credibility score based on follower count (0..1)
  // Log scale: 10 followers = 0.33, 100 = 0.66, 1000+ = 1.0
  const cred = Math.min(1, Math.log10(input.fcFollowers + 10) / 3);
  
  // 4. Weighted final score
  const score = 0.5 * seedOverlap + 0.35 * kw + 0.15 * cred;
  
  // 5. Apply thresholds
  const passes = input.seedCount >= thresholds.minSeedFollows && score >= thresholds.minScore;
  
  return {
    score,
    passes,
    why: {
      seeds: input.seedCount,
      keywordScore: kw,
      credibility: cred,
      followers: input.fcFollowers,
    },
  };
}

/**
 * Calculate Jaccard similarity between two sets
 */
export function jaccardSimilarity(set1: string[], set2: string[]): number {
  const s1 = new Set(set1.map(s => s.toLowerCase()));
  const s2 = new Set(set2.map(s => s.toLowerCase()));
  
  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}
