import { SeedZ, type SeedOut, SYSTEM_PROMPT } from "./seed-schema";
import { normalizeHandle, normalizeFarcasterHandle } from "./handle-utils";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

export async function autoSeedRaw(query: string, opts?: {
  audience?: string; region?: string; seniority?: string;
  temperature?: number;
}): Promise<SeedOut> {
  if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is not set");

  const userPrompt =
`Task: Generate seeds for a topic search in a graph discovery app.
User query: "${query}"
Context: audience=${opts?.audience ?? "builders/recruiters"}, region=${opts?.region ?? "global"}, seniority=${opts?.seniority ?? "any"}.
Return JSON only per schema.`;

  const resp = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: {
          temperature: opts?.temperature ?? 0.2,
          response_mime_type: "application/json",
        },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini error: ${resp.status} ${text}`);
  }

  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  let raw: any = {};
  try { raw = JSON.parse(text); } catch {}
  if (!raw || typeof raw !== 'object') raw = {};
  if (!raw.seeds) raw.seeds = { farcaster: [], twitter: [] };
  raw.seeds.farcaster = Array.isArray(raw.seeds.farcaster) ? raw.seeds.farcaster.slice(0, 8) : [];
  raw.seeds.twitter   = Array.isArray(raw.seeds.twitter) ? raw.seeds.twitter.slice(0, 8) : [];
  if (Array.isArray(raw.candidates)) raw.candidates = raw.candidates.slice(0, 100);
  if (!raw.thresholds) raw.thresholds = { minSeedFollows: 3, minScore: 0.65 };
  if (!raw.caps) raw.caps = { maxSeedFollowersPerSeed: 2000, hydrateTopK: 300 };
  if (!raw.normalized_keywords) raw.normalized_keywords = { positive: [], weak: [], negative: [] };
  if (!raw.topic) raw.topic = String(query || "");
  const parsed = SeedZ.parse(raw);
  parsed.seeds.farcaster = Array.from(new Set(parsed.seeds.farcaster.map(normalizeFarcasterHandle).filter(Boolean)));
  parsed.seeds.twitter = Array.from(new Set(parsed.seeds.twitter.map(normalizeHandle).filter(Boolean)));
  return parsed;
}
