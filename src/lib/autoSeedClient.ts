'use client';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { SeedZ, type SeedOut, SYSTEM_PROMPT } from "./seed-schema";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

function arrStr(x: any): string[] {
  if (!Array.isArray(x)) return [];
  return x.map(v => String(v ?? "")) as string[];
}

function normHandle(h: string): string {
  return String(h || "").replace(/^@/, "").toLowerCase();
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
  fc = uniq(arrStr(fc).map(normHandle));
  tw = uniq(arrStr(tw).map(normHandle));

  const candidates: any[] = [];
  const fcCand = arrStr(seedsBlock?.farcaster?.candidates);
  const twCand = arrStr(seedsBlock?.twitter?.candidates ?? seedsBlock?.twitter_x?.candidates);
  for (const h of fcCand) candidates.push({ platform: "farcaster", handle: normHandle(h) });
  for (const h of twCand) candidates.push({ platform: "twitter", handle: normHandle(h) });
  if (Array.isArray(raw?.candidates)) {
    for (const c of raw.candidates) {
      if (c && c.platform && c.handle) {
        const p = String(c.platform).toLowerCase() === "farcaster" ? "farcaster" : "twitter";
        const cand: any = { platform: p, handle: normHandle(c.handle) };
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

  let model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig,
  });

  const userPrompt =
`Task: Generate seeds for a topic search in a graph discovery app.
User query: "${query}"
Context: audience=${opts?.audience ?? "builders/recruiters"}, region=${opts?.region ?? "global"}, seniority=${opts?.seniority ?? "any"}.
Return JSON only per schema.`;

  let res;
  try {
    res = await model.generateContent(userPrompt);
  } catch (err: any) {
    const msg = String(err?.message || err).toLowerCase();
    if (msg.includes("404") || msg.includes("not found")) {
      model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT,
        generationConfig,
      });
      res = await model.generateContent(userPrompt);
    } else {
      throw err;
    }
  }

  const text = res.response.text();
  let raw: any = {};
  try { raw = JSON.parse(text); } catch {}
  raw = normalizeToSeedRaw(query, raw);
  raw.seeds.farcaster = Array.isArray(raw.seeds.farcaster) ? raw.seeds.farcaster.slice(0, 8) : [];
  raw.seeds.twitter   = Array.isArray(raw.seeds.twitter) ? raw.seeds.twitter.slice(0, 8) : [];
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
  const parsed = SeedZ.parse(raw);
  parsed.seeds.farcaster = parsed.seeds.farcaster.map(h => h.replace(/^@/,'').toLowerCase());
  parsed.seeds.twitter   = parsed.seeds.twitter.map(h => h.replace(/^@/,'').toLowerCase());
  return parsed;
}
