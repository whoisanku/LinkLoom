import { z } from "zod";
import { SchemaType, type Schema } from "@google/generative-ai";

export const SeedZ = z.object({
  topic: z.string(),
  normalized_keywords: z.object({
    positive: z.array(z.string()).default([]),
    weak: z.array(z.string()).default([]),
    negative: z.array(z.string()).default([]),
  }),
  seeds: z.object({
    farcaster: z.array(z.string()).max(5).default([]),
    twitter: z.array(z.string()).max(8).default([]),
  }),
  candidates: z.array(z.object({
    platform: z.enum(["farcaster","twitter"]),
    handle: z.string(),
    type: z.enum(["org","lab","foundation","maintainer","individual"]).optional(),
    confidence: z.number().min(0).max(1).optional(),
    reason: z.string().optional(),
  })).default([]),
  thresholds: z.object({
    minSeedFollows: z.number().int().min(1).default(3),
    minScore: z.number().min(0).max(1).default(0.3),
  }),
  caps: z.object({
    maxSeedFollowersPerSeed: z.number().int().min(200).max(5000).default(2000),
    hydrateTopK: z.number().int().min(50).max(1000).default(300),
  }),
  notes: z.array(z.string()).default([]),
});
export type SeedOut = z.infer<typeof SeedZ>;
export const SeedSchema: Schema = ({
  type: SchemaType.OBJECT,
  properties: {
    topic: { type: SchemaType.STRING },
    normalized_keywords: {
      type: SchemaType.OBJECT,
      properties: {
        positive: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }},
        weak:     { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }},
        negative: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }},
      },
      required: ["positive","weak","negative"]
    },
    seeds: {
      type: SchemaType.OBJECT,
      properties: {
        farcaster: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, maxItems: 5 },
        twitter:   { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, maxItems: 8 },
      },
      required: ["farcaster","twitter"]
    },
    candidates: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          platform: { type: SchemaType.STRING, enum: ["farcaster","twitter"] },
          handle:   { type: SchemaType.STRING },
          type:     { type: SchemaType.STRING, enum: ["org","lab","foundation","maintainer","individual"] },
          confidence:{ type: SchemaType.NUMBER },
          reason:   { type: SchemaType.STRING }
        },
        required: ["platform","handle"]
      },
      maxItems: 100
    },
    thresholds: {
      type: SchemaType.OBJECT,
      properties: {
        minSeedFollows: { type: SchemaType.NUMBER },
        minScore:       { type: SchemaType.NUMBER }
      }
    },
    caps: {
      type: SchemaType.OBJECT,
      properties: {
        maxSeedFollowersPerSeed: { type: SchemaType.NUMBER },
        hydrateTopK:             { type: SchemaType.NUMBER }
      }
    },
    notes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
  },
  required: ["topic","normalized_keywords","seeds","thresholds","caps"]
} as unknown) as Schema;

export const SYSTEM_PROMPT = `
You are SeedSynth, an expert topic-to-seed generator for LinkLoom.
Return STRICT JSON only with EXACT keys and shapes below. No extra fields. No prose.

Keys and rules:
- topic: string
- normalized_keywords: { positive: string[]; weak: string[]; negative: string[] }
- seeds: { farcaster: string[]; twitter: string[] }
- candidates: { platform: "farcaster"|"twitter"; handle: string; type?: "org"|"lab"|"foundation"|"maintainer"|"individual"; confidence?: number; reason?: string }[]
- thresholds: { minSeedFollows: number; minScore: number }
- caps: { maxSeedFollowersPerSeed: number; hydrateTopK: number }
- notes: string[]

Constraints:
- Handles must be usernames without @.
- Farcaster usernames must exclude suffixes like ".eth", ".base.eth", ".farcaster", ".warpcast" (use only the root handle).
- Prefer orgs/labs/foundations; include a few key maintainers if essential.
- Keep seeds small but high-quality: up to 5 for Farcaster and up to 8 for Twitter.
- If unsure about a handle, put it in candidates with low confidence and do not include in seeds.
- Do not use alternative key names like keywords, seed_accounts, twitter_x, or nested objects for platforms.
`;
