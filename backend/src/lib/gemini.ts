import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

// Initialize the Gemini client once and reuse it across the application.
const genAI = new GoogleGenerativeAI(apiKey);

// Configure the model to be used across all functions, ensuring consistency.
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Generate negative keywords for a topic using Gemini.
 */
export async function generateNegativeKeywords(topic: string): Promise<string[]> {
  try {
    const prompt = `Given the topic: "${topic}"

Generate a list of negative keywords that should be filtered out when searching for relevant profiles. These are terms that indicate the person is NOT genuinely interested in the topic, but rather:
- Marketing/promotional accounts
- Spam/bot accounts
- Generic community managers
- Airdrop hunters
- Unrelated interests

Return ONLY a JSON array of 5-10 negative keywords, nothing else.
Example: ["airdrop", "giveaway", "marketing", "community manager", "follow for follow"]`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`🚫 Generated negative keywords:`, parsed);
      return parsed;
    }

    return ['airdrop', 'giveaway', 'marketing', 'community manager'];
  } catch (error) {
    console.error('Error generating negative keywords:', error);
    return ['airdrop', 'giveaway', 'marketing', 'community manager'];
  }
}

/**
 * Bulk check profiles in chunks to provide progress updates.
 */
export async function batchCheckBioAlignment(
  candidates: Array<{ bio: string; username: string; id: string }>,
  topic: string,
  negativeKeywords: string[],
  chunkSize: number = 100 // Process 100 candidates per API call
): Promise<Map<string, { aligned: boolean; confidence: number; reason?: string }>> {
  const results = new Map<string, { aligned: boolean; confidence: number; reason?: string }>();

  if (candidates.length === 0) {
    return results;
  }

  console.log(`🤖 Processing ${candidates.length} candidates in chunks of ${chunkSize}...`);

  try {
    for (let i = 0; i < candidates.length; i += chunkSize) {
      const chunk = candidates.slice(i, i + chunkSize);
      console.log(`📦 Processing chunk ${Math.floor(i / chunkSize) + 1}: ${chunk.length} candidates (${i + 1}-${i + chunk.length}/${candidates.length})`);

      const candidatesList = chunk.map((c, idx) => 
        `${idx + 1}. ID: ${c.id}\n   Username: @${c.username}\n   Bio: ${c.bio || 'N/A'}`
      ).join('\n\n');

      const systemInstruction = `You are an expert at analyzing user profiles for relevance. Respond ONLY with valid JSON arrays.`;

      const userPrompt = `Task: Analyze ${chunk.length} Farcaster profiles for relevance to a topic.

Topic: "${topic}"
Negative keywords: ${negativeKeywords.join(', ')}

PROFILES:
${candidatesList}

Return a JSON array for ALL ${chunk.length} profiles:
[{"id": "123", "aligned": true, "confidence": 0.85, "reason": "brief"}, ...]`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const response = result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        for (const item of parsed) {
          if (item.id) {
            results.set(item.id, {
              aligned: item.aligned === true,
              confidence: typeof item.confidence === 'number' ? item.confidence : 0.5,
              reason: item.reason || '',
            });
          }
        }
        console.log(`✅ Chunk complete: ${parsed.filter((p: any) => p.aligned).length}/${chunk.length} aligned`);
      } else {
        console.warn(`⚠️ Failed to parse response for chunk, marking all as aligned (fail-open)`);
        for (const candidate of chunk) {
          results.set(candidate.id, { aligned: true, confidence: 0.5, reason: 'Parse error' });
        }
      }
    }
  } catch (error) {
    console.error('❌ Error during bulk processing:', error);
    for (const candidate of candidates) {
      if (!results.has(candidate.id)) {
        results.set(candidate.id, { aligned: true, confidence: 0.5, reason: 'Error during processing' });
      }
    }
  }

  console.log(`🎉 Finished processing all chunks.`);
  return results;
}
