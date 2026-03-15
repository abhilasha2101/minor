import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `You are an expert fact-checker and investigative journalist AI. Your job is to verify whether a given news claim is TRUE, FALSE, MISLEADING, or UNVERIFIED.

You have access to a web search tool. Use it to search for multiple reliable sources to verify the claim. After searching, you MUST output your final verdict.

Your FINAL response (after searching) must be ONLY a raw JSON object — no explanation, no markdown, no backticks, no text before or after the JSON. Start your response with { and end with }.

Use this exact JSON structure:
{
  "verdict": "TRUE",
  "confidence": 85,
  "summary": "2-3 sentence plain English explanation.",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "sources_checked": ["BBC", "Reuters"],
  "red_flags": [],
  "advice": "One sentence advice for the reader."
}

verdict must be exactly one of: TRUE, FALSE, MISLEADING, UNVERIFIED
confidence must be a number 0-100`;

app.post('/api/verify', async (req, res) => {
  try {
    const { news } = req.body;
    
    if (!news) {
      return res.status(400).json({ error: { message: "News claim is required." } });
    }

    const apiKey = req.headers['x-api-key'] || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: { message: "Gemini API key is missing. Please configure it in the settings panel or the server's .env file." } });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Verify this news claim: "${news}"` }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        tools: [{ google_search: {} }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("Error verifying news:", error);
    res.status(500).json({ error: { message: error.message || "Internal Server Error" } });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
