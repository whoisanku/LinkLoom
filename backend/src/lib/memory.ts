import type { FarcasterFollowersResponse, FarcasterProfile, FarcasterFollower, MemoryAPIOptions } from '../types/memory';

const MEMORY_API_BASE = 'https://api.memoryproto.co';

export class MemoryProtocolClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Fetch followers for a Farcaster user
   */
  async getFarcasterFollowers(options: MemoryAPIOptions): Promise<FarcasterFollowersResponse> {
    const params = new URLSearchParams();
    
    if (options.username) params.append('username', options.username);
    if (options.fid) params.append('fid', options.fid.toString());
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', Math.min(options.limit, 100).toString());

    const url = `${MEMORY_API_BASE}/farcaster/followers?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Memory API error: ${response.status} ${response.statusText}`);
    }

    return await response.json() as FarcasterFollowersResponse;
  }

  /**
   * Fetch all followers for a seed (with pagination and cap)
   * Returns full profile data for each follower
   */
  async getAllFollowers(username: string, maxFollowers: number = 2000): Promise<FarcasterFollower[]> {
    const allFollowers: FarcasterFollower[] = [];
    let page = 1;
    const limit = 100; // Max per request

    while (allFollowers.length < maxFollowers) {
      const response = await this.getFarcasterFollowers({
        username,
        page,
        limit,
      });

      if (!response.follows || response.follows.length === 0) {
        break;
      }

      allFollowers.push(...response.follows);

      // Stop if we've reached the cap or no more pages
      if (allFollowers.length >= maxFollowers || !response.next_cursor) {
        break;
      }

      page++;
    }

    return allFollowers.slice(0, maxFollowers);
  }

  /**
   * Get followers that a user follows (for cross-follower analysis)
   */
  async getFollowing(username: string, limit: number = 100): Promise<FarcasterFollower[]> {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('limit', Math.min(limit, 100).toString());

    const url = `${MEMORY_API_BASE}/farcaster/following?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json() as { follows: FarcasterFollower[] };
      return data.follows || [];
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  }
}

export function createMemoryClient(): MemoryProtocolClient {
  const token = process.env.MEMORY_PROTOCOL_API_TOKEN;
  
  if (!token) {
    throw new Error('MEMORY_PROTOCOL_API_TOKEN environment variable is required');
  }

  return new MemoryProtocolClient(token);
}
