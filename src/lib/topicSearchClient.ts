import { AxiosInstance } from '@/config/Axios';

export type TopicSearchWhy = {
  seeds: number;
  keywordScore: number;
  credibility: number;
  followers: number;
};

export type TopicCandidate = {
  fid: number;
  username: string;
  displayName?: string;
  bio?: string;
  pfpUrl?: string;
  score: number;
  why: TopicSearchWhy;
};

export type TopicSearchRequestPayload = {
  seeds: string[];
  topic: string;
  negative?: string[];
  thresholds: {
    minSeedFollows: number;
    minScore: number;
  };
  caps: {
    maxSeedFollowersPerSeed: number;
    hydrateTopK: number;
  };
};

export type TopicSearchResponsePayload = {
  success: boolean;
  message: string;
  candidates?: TopicCandidate[];
  metadata?: {
    totalCandidates: number;
    seedsUsed: string[];
    topicKeywords: string[];
  };
};

export async function fetchTopicCandidates(
  payload: TopicSearchRequestPayload,
): Promise<TopicSearchResponsePayload> {
  const farcasterSeeds = Array.isArray(payload.seeds)
    ? payload.seeds.filter((h) => Boolean(h && String(h).trim())).slice(0, 5)
    : [];

  const minScore = 0.3;
  const dynamicMin = farcasterSeeds.length > 0
    ? Math.max(1, Math.min(farcasterSeeds.length, Math.floor(farcasterSeeds.length / 2)))
    : 0;
  const minSeedFollows = dynamicMin;

  const caps = {
    maxSeedFollowersPerSeed: 2000,
    hydrateTopK: (payload.caps && payload.caps.hydrateTopK) ?? 300,
  };

  const requestBody = {
    seeds: { farcaster: farcasterSeeds },
    topic: payload.topic,
    negative: payload.negative ?? [],
    thresholds: { minSeedFollows, minScore },
    caps,
  };

  try {
    const response = await AxiosInstance.post<TopicSearchResponsePayload>(
      '/api/topic/search',
      requestBody,
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Candidate search failed');
    }

    return response.data;
  } catch (error: any) {
    const message = typeof error?.message === 'string' ? error.message : 'Candidate search failed';
    throw new Error(message.includes('Candidate search failed') ? message : `Candidate search failed: ${message}`);
  }
}
