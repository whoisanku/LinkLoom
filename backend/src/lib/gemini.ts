import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;

/**
 * Initialize Gemini AI client
 */
export function initGemini(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Check if a bio aligns with the target topic using Gemini 2.5 Flash
 */
export async function checkBioAlignment(bio: string, topic: string): Promise<{ aligned: boolean; confidence: number; reason?: string }> {
  try {
    // Skip empty bios
    if (!bio || bio.trim().length === 0) {
      return { aligned: false, confidence: 0, reason: 'Empty bio' };
    }

    const genAI = initGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `You are an expert at analyzing user profiles for relevance to specific topics.

Topic: "${topic}"
Bio: "${bio}"

Does this bio indicate that the person is relevant to the topic? Consider:
- Direct mentions of related technologies, concepts, or communities
- Professional experience or interests that align
- Active involvement in the topic area

Respond in JSON format:
{
  "aligned": true/false,
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}

Be strict but fair. Only mark as aligned if there's clear relevance.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        aligned: parsed.aligned === true,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
        reason: parsed.reason || '',
      };
    }

    // Fallback: simple keyword check
    return { aligned: false, confidence: 0, reason: 'Failed to parse AI response' };
  } catch (error) {
    console.error('Error checking bio alignment:', error);
    // On error, don't filter out (fail open)
    return { aligned: true, confidence: 0.5, reason: 'Error during check' };
  }
}

/**
 * Batch check multiple bios for alignment (with rate limiting)
 */
export async function batchCheckBioAlignment(
  candidates: Array<{ bio: string; id: string }>,
  topic: string,
  batchSize: number = 10
): Promise<Map<string, { aligned: boolean; confidence: number; reason?: string }>> {
  const results = new Map<string, { aligned: boolean; confidence: number; reason?: string }>();

  // Process in batches to avoid rate limits
  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    
    const promises = batch.map(async (candidate) => {
      const result = await checkBioAlignment(candidate.bio, topic);
      return { id: candidate.id, result };
    });

    const batchResults = await Promise.all(promises);
    
    for (const { id, result } of batchResults) {
      results.set(id, result);
    }

    // Small delay between batches
    if (i + batchSize < candidates.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}
