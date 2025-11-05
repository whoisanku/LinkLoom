'use client';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { SeedZ, type SeedOut, SYSTEM_PROMPT } from "./seed-schema";
import type { FarcasterSeedEvidence } from "./farcasterValidation";
import { normalizeHandle, normalizeFarcasterHandle } from "./handle-utils";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

function arrStr(x: any): string[] {
  if (!Array.isArray(x)) return [];
  return x.map(v => String(v ?? "")) as string[];
}

function clamp(n: any, min: number, max: number): number {
  const x = Number(n);
  return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : min;
}

function toInt(n: any, def: number): number {
  const x = parseInt(String(n), 10);
  return Number.isFinite(x) ? x : def;
}

function mapType(t: any): "org"|"lab"|"foundation"|"maintainer"|"individual"|undefined {
  const s = String(t ?? "").toLowerCase();
  if (["org","organization","company","protocol","project"].includes(s)) return "org";
  if (s === "lab" || s.endsWith("lab") || s.includes("labs")) return "lab";
  if (s === "foundation" || s.includes("foundation")) return "foundation";
  if (["maintainer","maintainers","core","core dev","developer","dev"].includes(s)) return "maintainer";
  if (["individual","person","researcher","engineer"].includes(s)) return "individual";
  return undefined;
}

function uniq(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

function normalizeToSeedRaw(query: string, raw: any): any {
  if (raw && raw.candidates && raw.candidates[0]?.content?.parts?.[0]?.text) {
    try { raw = JSON.parse(raw.candidates[0].content.parts[0].text); } catch {}
  }

  const topic = raw?.topic ?? String(query || "");

  const kw = raw?.normalized_keywords ?? raw?.keywords ?? {};
  const normalized_keywords = {
    positive: arrStr(kw?.positive),
    weak: arrStr(kw?.weak),
    negative: arrStr(kw?.negative),
  };

  const seedsBlock = raw?.seeds ?? raw?.seed_accounts ?? {};
  let fc = seedsBlock?.farcaster?.seeds ?? seedsBlock?.farcaster ?? [];
  let tw = seedsBlock?.twitter?.seeds ?? seedsBlock?.twitter ?? seedsBlock?.twitter_x?.seeds ?? seedsBlock?.twitter_x ?? [];
  fc = uniq(arrStr(fc).map(normalizeFarcasterHandle).filter(Boolean));
  tw = uniq(arrStr(tw).map(normalizeHandle).filter(Boolean));

  const candidates: any[] = [];
  const fcCand = arrStr(seedsBlock?.farcaster?.candidates)
    .map(normalizeFarcasterHandle)
    .filter(Boolean);
  const twCand = arrStr(seedsBlock?.twitter?.candidates ?? seedsBlock?.twitter_x?.candidates)
    .map(normalizeHandle)
    .filter(Boolean);
  for (const h of fcCand) candidates.push({ platform: "farcaster", handle: h });
  for (const h of twCand) candidates.push({ platform: "twitter", handle: h });
  if (Array.isArray(raw?.candidates)) {
    for (const c of raw.candidates) {
      if (c && c.platform && c.handle) {
        const p = String(c.platform).toLowerCase() === "farcaster" ? "farcaster" : "twitter";
        const normalizedHandle = p === "farcaster"
          ? normalizeFarcasterHandle(c.handle)
          : normalizeHandle(c.handle);
        if (!normalizedHandle) continue;
        const cand: any = { platform: p, handle: normalizedHandle };
        const t = mapType(c.type);
        if (t) cand.type = t;
        const conf = c.confidence != null ? clamp(c.confidence, 0, 1) : undefined;
        if (conf != null) cand.confidence = conf;
        if (typeof c.reason === 'string' && c.reason.length) cand.reason = c.reason;
        candidates.push(cand);
      }
    }
  }

  let thresholds = raw?.thresholds;
  let caps = raw?.caps;
  const ges = raw?.graph_expansion_settings;
  if (!thresholds && ges) thresholds = { minSeedFollows: toInt(ges?.min_followers, 3), minScore: clamp(ges?.connection_threshold, 0, 1) };
  if (!caps && ges) caps = { maxSeedFollowersPerSeed: toInt(ges?.min_followers, 2000), hydrateTopK: toInt(ges?.max_nodes, 300) };

  return {
    topic,
    normalized_keywords,
    seeds: { farcaster: fc, twitter: tw },
    candidates,
    thresholds,
    caps,
    notes: Array.isArray(raw?.notes) ? arrStr(raw.notes) : [],
  };
}

function finalizeSeedOutput(query: string, text: string): SeedOut {
  let raw: any = {};
  try { raw = JSON.parse(text); } catch {}
  raw = normalizeToSeedRaw(query, raw);
  raw.seeds.farcaster = Array.isArray(raw.seeds?.farcaster) ? raw.seeds.farcaster.slice(0, 8) : [];
  raw.seeds.twitter   = Array.isArray(raw.seeds?.twitter) ? raw.seeds.twitter.slice(0, 8) : [];
  if (Array.isArray(raw.candidates)) raw.candidates = raw.candidates.slice(0, 100);
  const th = raw.thresholds ?? {};
  const cs = raw.caps ?? {};
  raw.thresholds = {
    minSeedFollows: Math.max(1, toInt(th.minSeedFollows, 3)),
    minScore: clamp(th.minScore, 0, 1),
  };
  raw.caps = {
    maxSeedFollowersPerSeed: Math.max(200, Math.min(5000, toInt(cs.maxSeedFollowersPerSeed, 2000))),
    hydrateTopK: Math.max(50, Math.min(1000, toInt(cs.hydrateTopK, 300))),
  };
  if (!raw.normalized_keywords) raw.normalized_keywords = { positive: [], weak: [], negative: [] };
  if (!raw.topic) raw.topic = String(query || "");
  if (!Array.isArray(raw.notes)) raw.notes = [];
  const parsed = SeedZ.parse(raw);
  parsed.seeds.farcaster = uniq(parsed.seeds.farcaster.map(normalizeFarcasterHandle).filter(Boolean));
  parsed.seeds.twitter   = uniq(parsed.seeds.twitter.map(normalizeHandle).filter(Boolean));
  return parsed;
}

function extractStatus(err: any): number | null {
  if (!err) return null;
  const candidates = [
    err.status,
    err.statusCode,
    err.code,
    err?.response?.status,
    err?.cause?.status,
    err?.cause?.response?.status,
  ];
  for (const value of candidates) {
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) return num;
  }
  return null;
}

function shouldRetry(error: any): boolean {
  const status = extractStatus(error);
  if (status && [408, 409, 429, 500, 502, 503, 504].includes(status)) return true;
  const message = String(error?.message || error || "").toLowerCase();
  if (!message) return false;
  return message.includes("overloaded")
    || message.includes("temporarily unavailable")
    || message.includes("timeout")
    || message.includes("try again later")
    || message.includes("deadline exceeded");
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateWithRetry(
  factory: () => ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  prompt: string,
  maxAttempts = 3,
): Promise<any> {
  let lastError: any = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const model = factory();
      return await model.generateContent(prompt);
    } catch (error) {
      lastError = error;
      const shouldTryAgain = shouldRetry(error) && attempt < maxAttempts - 1;
      if (!shouldTryAgain) throw error;
      const backoff = 400 * Math.pow(2, attempt);
      await delay(backoff);
    }
  }
  throw lastError;
}

export async function autoSeed(query: string, opts?: {
  audience?: string; region?: string; seniority?: string;
  temperature?: number;
}): Promise<SeedOut> {
  if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is not set");

  const genAI = new GoogleGenerativeAI(API_KEY);

  const generationConfig = {
    temperature: opts?.temperature ?? 0.2,
    responseMimeType: "application/json",
  } as const;

  const modelFactory = () => genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig,
  });

  const userPrompt =
`Task: Generate seeds for a topic search in a graph discovery app.
User query: "${query}"
Context: audience=${opts?.audience ?? "builders/recruiters"}, region=${opts?.region ?? "global"}, seniority=${opts?.seniority ?? "any"}.
Return JSON only per schema.`;

  const res = await generateWithRetry(modelFactory, userPrompt);
  const text = res.response.text();
  return finalizeSeedOutput(query, text);
}

export async function refineSeedsWithEvidence(params: {
  query: string;
  roughSeed?: SeedOut | null;
  confirmedSeeds: { farcaster: string[]; twitter: string[] };
  evidence: FarcasterSeedEvidence[];
  temperature?: number;
}): Promise<SeedOut> {
  if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is not set");

  const genAI = new GoogleGenerativeAI(API_KEY);

  const generationConfig = {
    temperature: params.temperature ?? 0.2,
    responseMimeType: "application/json",
  } as const;

  const modelFactory = () => genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig,
  });

  const farcasterSeeds = Array.from(new Set(
    (params.confirmedSeeds.farcaster ?? []).map(normalizeFarcasterHandle).filter(Boolean)
  )).slice(0, 10);
  const twitterSeeds = Array.from(new Set(
    (params.confirmedSeeds.twitter ?? []).map(normalizeHandle).filter(Boolean)
  )).slice(0, 8);

  const refinementPayload = {
    query: params.query,
    roughSeedSchema: params.roughSeed ?? null,
    userConfirmedSeeds: {
      farcaster: farcasterSeeds,
      twitter: twitterSeeds,
    },
    farcasterEvidence: params.evidence.slice(0, 10),
  };

  const userPrompt =
`Task: Refine a topic seed schema for LinkLoom using Farcaster validation evidence.
Original query: "${params.query}"

Instructions:
1. Start from userConfirmedSeeds as the baseline, which reflects manual edits.
2. Cross-check every Farcaster handle against farcasterEvidence. Keep only handles that the evidence supports. If the evidence shows a corrected variant, fix the handle.
3. Move unsupported Farcaster handles to candidates with a reason and low confidence, or remove them.
4. Add high-signal Farcaster handles surfaced in the evidence when they improve coverage.
5. Preserve Twitter seeds unless clearly invalid.
6. Respect all system constraints and return valid JSON only.

Context JSON:
${JSON.stringify(refinementPayload, null, 2)}`;

  const res = await generateWithRetry(modelFactory, userPrompt);
  const text = res.response.text();
  return finalizeSeedOutput(params.query, text);
}
