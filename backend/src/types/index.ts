export interface Seeds {
  farcaster: string[];
}

export interface Thresholds {
  minSeedFollows: number;
  minScore: number;
}

export interface Caps {
  maxSeedFollowersPerSeed: number;
  hydrateTopK: number;
}

export interface TopicSearchRequest {
  seeds: Seeds;
  topic: string;
  negative: string[];
  thresholds: Thresholds;
  caps: Caps;
}

export interface Candidate {
  fid: number;
  username: string;
  displayName?: string;
  bio?: string;
  pfpUrl?: string;
  score: number;
  why: {
    seeds: number;
    keywordScore: number;
    credibility: number;
    followers: number;
  };
}

export interface TopicSearchResponse {
  success: boolean;
  message: string;
  candidates?: Candidate[];
  metadata?: {
    totalCandidates: number;
    seedsUsed: string[];
    topicKeywords: string[];
  };
}
