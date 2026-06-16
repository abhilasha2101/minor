/**
 * Gemini Service — Encapsulates all Gemini AI API communication.
 * Handles system prompts, Google Search grounding, response schema, and multimodal OCR.
 */

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * System prompt instructing the AI fact-checking agent.
 */
const SYSTEM_PROMPT = `You are an expert fact-checker and investigative journalist AI. Your job is to verify whether a given news claim is TRUE, FALSE, MISLEADING, or UNVERIFIED, and provide a deep media forensics analysis.

You have access to a Google Search engine. Use it to search for multiple reputable sources to verify the claim. After searching, you must render your final verdict as a raw JSON object. Do not wrap the JSON in markdown code blocks if possible.

The verdict labels are:
- TRUE: Supported by multiple reliable sources and official releases.
- FALSE: Contradicted by facts, official statements, or physical laws.
- MISLEADING: Contains elements of truth but is exaggerated or taken out of context.
- UNVERIFIED: Insufficient online source evidence exists.

Your response MUST be a pure JSON object adhering to this exact schema:
{
  "verdict": "TRUE|FALSE|MISLEADING|UNVERIFIED",
  "confidence": <integer 0-100>,
  "summary": "Detailed summary paragraph",
  "key_findings": ["finding 1", "finding 2", ...],
  "sources_checked": ["source 1 URL/Name", "source 2 URL/Name", ...],
  "red_flags": ["flag 1", "flag 2", ...],
  "advice": "Media literacy advice",
  "deepAnalysis": {
    "factuality": <integer 0-100>,
    "objectivity": <integer 0-100>,
    "sensationalism": <integer 0-100>,
    "emotionalTone": <integer 0-100>,
    "logicalConsistency": <integer 0-100>,
    "sourceCredibility": <integer 0-100>
  }
}

Enforce neutrality and objectiveness in summaries.`;

/**
 * Verify a text-based news claim via Gemini API with Google Search grounding.
 * @param {string} claim - The news claim to verify
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<object>} Raw Gemini API response
 */
export async function verifyTextClaim(claim, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);

  try {
    const response = await fetch(
      `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `Verify this news claim: "${claim}"` }] }
          ],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          tools: [{ google_search: {} }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || `Gemini API responded with status ${response.status}`;
      throw new Error(errMsg);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Verify an image/screenshot claim via Gemini multimodal OCR + Google Search.
 * @param {string} base64Image - Base64 encoded image data
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<object>} Raw Gemini API response
 */
export async function verifyImageClaim(base64Image, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40000);

  try {
    const response = await fetch(
      `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: 'OCR-read and analyze the main text news claims in this screenshot. Search online to cross-verify facts and output your verdict report in the structured schema.'
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Image
                  }
                }
              ]
            }
          ],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          tools: [{ google_search: {} }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data.error?.message || `Gemini API responded with status ${response.status}`;
      throw new Error(errMsg);
    }

    return data;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Parse the raw Gemini response into a normalized result object.
 * @param {object} data - Raw Gemini response
 * @returns {object} Parsed verification result
 */
export function parseGeminiResponse(data) {
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('No text response from AI');

  let parsed;
  try {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON object boundaries found');
    parsed = JSON.parse(rawText.slice(start, end + 1));
  } catch {
    try {
      const clean = rawText.replace(/```json|```/gi, '').trim();
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error('[GeminiService] JSON parsing failed. Raw response was:\n', rawText);
      throw new Error('Failed to parse fact report format. AI did not return a valid schema.');
    }
  }

  return {
    verdict: ['TRUE', 'FALSE', 'MISLEADING', 'UNVERIFIED'].includes(parsed.verdict) ? parsed.verdict : 'UNVERIFIED',
    confidence: Math.max(0, Math.min(100, Math.round(Number(parsed.confidence) || 0))),
    summary: parsed.summary || 'Summary unavailable.',
    key_findings: Array.isArray(parsed.key_findings) ? parsed.key_findings : [],
    sources_checked: Array.isArray(parsed.sources_checked) ? parsed.sources_checked : [],
    red_flags: Array.isArray(parsed.red_flags) ? parsed.red_flags : [],
    advice: parsed.advice || '',
    deepAnalysis: {
      factuality: Math.max(0, Math.min(100, Math.round(Number(parsed.deepAnalysis?.factuality) || 50))),
      objectivity: Math.max(0, Math.min(100, Math.round(Number(parsed.deepAnalysis?.objectivity) || 50))),
      sensationalism: Math.max(0, Math.min(100, Math.round(Number(parsed.deepAnalysis?.sensationalism) || 50))),
      emotionalTone: Math.max(0, Math.min(100, Math.round(Number(parsed.deepAnalysis?.emotionalTone) || 50))),
      logicalConsistency: Math.max(0, Math.min(100, Math.round(Number(parsed.deepAnalysis?.logicalConsistency) || 50))),
      sourceCredibility: Math.max(0, Math.min(100, Math.round(Number(parsed.deepAnalysis?.sourceCredibility) || 50)))
    }
  };
}
