import { normalizeFarcasterHandle } from "./handle-utils";
import type { TopicCandidate } from "@/lib/topicSearchClient";

type Endpoint = "channels" | "users" | "casts";

export type FarcasterEndpointResult = {
  url: string;
  ok: boolean;
  status: number;
  data?: unknown;
  error?: string;
};

export type FarcasterSeedEvidence = {
  raw: string;
  handle: string;
  endpoints: Record<Endpoint, FarcasterEndpointResult>;
};

const BASE_URL = import.meta.env?.DEV ? "/fc/v2" : "https://client.farcaster.xyz/v2";

function buildUrl(endpoint: Endpoint, query: string): string {
  const encodedQuery = encodeURIComponent(query);
  if (endpoint === "channels") {
    return `${BASE_URL}/search-channels?q=${encodedQuery}&prioritizeFollowed=false&forComposer=false&limit=2`;
  }
  if (endpoint === "users") {
    return `${BASE_URL}/search-users?q=${encodedQuery}&excludeSelf=false&limit=2&includeDirectCastAbility=false`;
  }
  return `${BASE_URL}/search-casts?q=${encodedQuery}&limit=20`;
}

function stripFillerPhrases(text: string): string {
  let s = String(text || "").toLowerCase();
  const patterns = [
    /\b(i am|i'm|we are|we're)\b/g,
    /\b(looking for|searching for|seeking|hiring|need|needing|wanted|want to find|find me|find)\b/g,
    /\b(someone|who can|to)\b/g,
  ];
  for (const re of patterns) s = s.replace(re, " ");
  s = s.replace(/[^a-z0-9_\.\-\s]/g, " ").replace(/\s+/g, " ").trim();
  return s;
}

function buildHeuristicTerms(query: string): string[] {
  const core = stripFillerPhrases(query);
  const set = new Set<string>();
  if (core) set.add(core);
  const words = core.match(/[a-z0-9_\.\-]{3,}/g) || [];
  for (const w of words) set.add(w);
  const lower = core.toLowerCase();
  if (lower.includes("zk") || lower.includes("zero knowledge")) {
    set.add("zk");
    set.add("zero knowledge");
    set.add("zksync");
  }
  if (/engineering|engineer/.test(lower)) {
    set.add(lower.replace(/engineering/g, "engineer"));
    set.add(lower.replace(/engineer/g, "engineering"));
    set.add(lower.replace(/engineering|engineer/g, "developer"));
  }
  return Array.from(set).slice(0, 6);
}

export async function quickProfilesForQuery(query: string, max = 30): Promise<TinderProfile[]> {
  const terms = buildHeuristicTerms(query);
  const contexts = await Promise.all(
    terms.map((t) => gatherFarcasterSearchForQuery(t, { users: 12 }))
  );
  const seen = new Set<string>();
  const out: TinderProfile[] = [];
  for (const ctx of contexts) {
    const users = (ctx.endpoints.users.data as any)?.users as Array<any> | undefined;
    if (!Array.isArray(users)) continue;
    for (const u of users) {
      const username = normalizeFarcasterHandle(u?.username || "");
      if (!username || seen.has(username)) continue;
      seen.add(username);
      out.push({
        id: Number(u?.fid ?? 0),
        name: String(u?.displayName || username),
        mainImage: String(u?.pfpUrl || u?.pfp?.url || "/placeholder.svg"),
        bio: String(u?.profileBio || u?.profile?.bio?.text || ""),
        interests: [],
        gallery: [],
        passions: [],
        distance: undefined,
        job: undefined,
        education: undefined,
      });
      if (out.length >= max) return out;
    }
  }
  return out.slice(0, max);
}

export type TinderProfile = {
  id: number;
  name: string;
  age?: number;
  distance?: string;
  mainImage: string;
  bio: string;
  job?: string;
  education?: string;
  interests: string[];
  gallery: string[];
  passions: string[];
  score?: number;
  seedFollows?: number;
};

export async function hydrateCandidatesToProfiles(candidates: TopicCandidate[], max = 20): Promise<TinderProfile[]> {
  const list = [...candidates].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, max);
  const out: TinderProfile[] = [];
  for (const c of list) {
    try {
      const basic = await fetchFarcasterUserBasic(c.username);
      out.push({
        id: c.fid,
        name: (basic?.displayName || c.displayName || c.username) as string,
        mainImage: basic?.avatarUrl || c.pfpUrl || "/placeholder.svg",
        bio: basic?.bio || c.bio || "",
        interests: [],
        gallery: [],
        passions: [],
        distance: undefined,
        job: undefined,
        education: undefined,
        score: typeof c.score === 'number' ? c.score : undefined,
        seedFollows: typeof c.why?.seeds === 'number' ? c.why.seeds : undefined,
      });
    } catch {}
  }
  return out;
}

function buildSearchUrl(endpoint: Endpoint, query: string, opts?: { channels?: number; users?: number; casts?: number }): string {
  const encodedQuery = encodeURIComponent(query);
  const chLimit = Math.max(1, Math.min(50, Math.floor(opts?.channels ?? 5)));
  const uLimit  = Math.max(1, Math.min(50, Math.floor(opts?.users ?? 10)));
  const cLimit  = Math.max(5, Math.min(100, Math.floor(opts?.casts ?? 50)));
  if (endpoint === "channels") {
    return `${BASE_URL}/search-channels?q=${encodedQuery}&prioritizeFollowed=false&forComposer=false&limit=${chLimit}`;
  }
  if (endpoint === "users") {
    return `${BASE_URL}/search-users?q=${encodedQuery}&excludeSelf=false&limit=${uLimit}&includeDirectCastAbility=false`;
  }
  return `${BASE_URL}/search-casts?q=${encodedQuery}&limit=${cLimit}`;
}

export type FarcasterUserBasic = {
  fid: number;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  followerCount?: number;
  location?: string;
};

export async function fetchFarcasterUserBasic(rawHandle: string): Promise<FarcasterUserBasic | null> {
  const handle = normalizeFarcasterHandle(rawHandle);
  if (!handle) return null;
  const url = buildSearchUrl("users", handle, { users: 5 });
  const result = await fetchEndpoint("users", url);
  const users = (result.data as any)?.users as Array<any> | undefined;
  if (!Array.isArray(users) || users.length === 0) return null;
  const match = users.find((u) => normalizeFarcasterHandle(u?.username) === handle) || users[0];
  if (!match) return null;
  return {
    fid: Number(match.fid),
    username: String(match.username || handle),
    displayName: match.displayName || undefined,
    bio: match.profileBio || undefined,
    avatarUrl: match.pfpUrl || undefined,
    followerCount: typeof match.followerCount === 'number' ? match.followerCount : undefined,
    location: match.location || undefined,
  };
}

function trimPayload(endpoint: Endpoint, payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const data = payload as Record<string, any>;
  if (endpoint === "channels" && Array.isArray(data.channels)) {
    return {
      channels: data.channels.slice(0, 3).map((channel: any) => ({
        key: channel?.key,
        name: channel?.name,
        description: channel?.description,
        followerCount: channel?.followerCount,
        memberCount: channel?.memberCount,
      })),
    };
  }
  if (endpoint === "users" && Array.isArray(data.users)) {
    return {
      users: data.users.slice(0, 5).map((user: any) => ({
        fid: user?.fid,
        username: user?.username,
        displayName: user?.displayName,
        followerCount: user?.followerCount,
        profileBio: user?.profile?.bio?.text,
        pfpUrl: user?.pfp?.url,
        location: user?.profile?.location?.description,
      })),
    };
  }
  if (endpoint === "casts" && Array.isArray(data.casts)) {
    return {
      casts: data.casts.slice(0, 5).map((cast: any) => ({
        hash: cast?.hash,
        text: cast?.text,
        timestamp: cast?.timestamp,
        mentions: cast?.mentions,
        author: cast?.author
          ? {
              fid: cast.author.fid,
              username: cast.author.username,
              displayName: cast.author.displayName,
            }
          : undefined,
      })),
    };
  }
  return payload;
}

async function fetchEndpoint(endpoint: Endpoint, url: string): Promise<FarcasterEndpointResult> {
  try {
    const resp = await fetch(url);
    const data = await resp.json().catch(() => null);
    const payload = data && typeof data === "object" && data !== null
      ? ((data as Record<string, unknown>).result ?? data)
      : data;
    return {
      url,
      ok: resp.ok,
      status: resp.status,
      data: trimPayload(endpoint, payload ?? undefined),
      error: resp.ok ? undefined : `Request failed with status ${resp.status}`,
    };
  } catch (error: any) {
    return {
      url,
      ok: false,
      status: 0,
      error: error?.message ?? "Network request failed",
    };
  }
}

export async function gatherFarcasterEvidence(rawHandle: string): Promise<FarcasterSeedEvidence | null> {
  const handle = normalizeFarcasterHandle(rawHandle);
  if (!handle) return null;
  const endpoints: Endpoint[] = ["channels", "users", "casts"];
  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      const url = buildUrl(endpoint, handle);
      const result = await fetchEndpoint(endpoint, url);
      return [endpoint, result] as const;
    })
  );
  return {
    raw: rawHandle,
    handle,
    endpoints: Object.fromEntries(results) as Record<Endpoint, FarcasterEndpointResult>,
  };
}

export async function gatherEvidenceForHandles(handles: string[], max = 10): Promise<FarcasterSeedEvidence[]> {
  const seen = new Set<string>();
  const normalized = handles
    .map((handle) => {
      const sanitized = normalizeFarcasterHandle(handle);
      if (!sanitized || seen.has(sanitized)) return null;
      seen.add(sanitized);
      return { raw: handle, sanitized };
    })
    .filter(Boolean)
    .slice(0, max) as { raw: string; sanitized: string }[];

  const evidence = await Promise.all(
    normalized.map((item) => gatherFarcasterEvidence(item.raw))
  );
  return evidence.filter(Boolean) as FarcasterSeedEvidence[];
}

export async function gatherFarcasterSearchForQuery(query: string, opts?: { channels?: number; users?: number; casts?: number }): Promise<{
  query: string;
  endpoints: Record<Endpoint, FarcasterEndpointResult>;
}> {
  const endpoints: Endpoint[] = ["channels", "users", "casts"];
  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      const url = buildSearchUrl(endpoint, query, opts);
      const result = await fetchEndpoint(endpoint, url);
      return [endpoint, result] as const;
    })
  );
  return {
    query,
    endpoints: Object.fromEntries(results) as Record<Endpoint, FarcasterEndpointResult>,
  };
}
