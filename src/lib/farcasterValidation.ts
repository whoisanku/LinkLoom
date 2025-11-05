import { normalizeFarcasterHandle } from "./handle-utils";

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
