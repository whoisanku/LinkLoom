// Memory Protocol API Types

export interface FarcasterFollower {
  id: string;
  username: string;
  displayName?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number | null;
  creationDate?: string | null;
  avatarUrl?: string | null;
  externalUrl?: string | null;
  location?: string | null;
  bio?: string;
}

export interface FarcasterFollowersResponse {
  follows: FarcasterFollower[];
  next_cursor?: string;
}

export interface FarcasterProfile {
  fid: number;
  username: string;
  display_name?: string;
  bio?: string;
  pfp_url?: string;
  follower_count?: number;
  following_count?: number;
}

export interface MemoryAPIOptions {
  username?: string;
  fid?: number;
  page?: number;
  limit?: number;
}
