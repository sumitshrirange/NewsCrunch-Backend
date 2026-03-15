const axios = require("axios");
const env = require("../config/env");

const VALID_SENTIMENTS = ["positive", "negative", "neutral"];
const VALID_CATEGORIES = [
  "Politics",
  "Technology",
  "Business",
  "Sports",
  "Entertainment",
  "Health",
  "Science",
  "World",
  "Environment",
  "Other",
];

const PROMPT = (
  title,
  content,
) => `You are a professional news editor. Analyze this article and return ONLY a valid JSON object with no markdown or backticks.

Article Title: ${title}
Article Content: ${content}

Required JSON format:
{
  "summary": "2-3 sentence summary in clear, concise language",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4"],
  "category": "one of: Politics, Technology, Business, Sports, Entertainment, Health, Science, World, Environment, Other",
  "sentiment": "one of: positive, negative, neutral",
  "readTime": <estimated original read time in minutes as a number>
}`;

/**
 * Call Gemini to summarize a scraped article.
 * @returns {{ summary, keyPoints, category, sentiment, readTime }}
 */
const summarizeArticle = async (title, content) => {
  if (!env.geminiApiKey) throw new Error("GEMINI_API_KEY is not configured");

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${env.geminiApiKey}`,
    {
      contents: [{ parts: [{ text: PROMPT(title, content) }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1000 },
    },
    { headers: { "Content-Type": "application/json" } },
  );

  const raw = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!raw) throw new Error("Empty response from Gemini");

  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned);

  return {
    summary: parsed.summary || "Summary not available.",
    keyPoints: Array.isArray(parsed.keyPoints)
      ? parsed.keyPoints.slice(0, 5)
      : [],
    category: VALID_CATEGORIES.includes(parsed.category)
      ? parsed.category
      : "Other",
    sentiment: VALID_SENTIMENTS.includes(parsed.sentiment)
      ? parsed.sentiment
      : "neutral",
    readTime: typeof parsed.readTime === "number" ? parsed.readTime : 3,
  };
};

module.exports = { summarizeArticle };
