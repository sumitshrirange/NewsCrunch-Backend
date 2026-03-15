const axios = require("axios");
const env = require("../config/env");

const extractDomain = (url) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
};

const mapItem = (item) => ({
  title: item.title || "Untitled",
  url: item.link || item.url || "",
  thumbnail: item.thumbnail || item.image || "",
  source:
    item.source?.name ||
    item.source ||
    extractDomain(item.link || item.url || ""),
  publishedAt: item.date || item.published_date || "",
  snippet: item.snippet || item.description || "",
});

const fetchNews = async ({ q = "latest news", category = "", page = 1 }) => {
  if (!env.serpApiKey)
    throw Object.assign(new Error("SERP_API_KEY is not configured"), {
      status: 500,
    });

  const query = category && category !== "All" ? `${q} ${category}` : q;

  const { data } = await axios.get("https://serpapi.com/search", {
    params: {
      engine: "google_news",
      q: query,
      api_key: env.serpApiKey,
      num: 20,
      start: (page - 1) * 20,
      hl: "en",
      gl: "us",
    },
  });

  const results = data.news_results || data.organic_results || [];
  const articles = results.filter((i) => i.link || i.url).map(mapItem);
  return { articles, query };
};

const fetchTrending = async () => {
  if (!env.serpApiKey)
    throw Object.assign(new Error("SERP_API_KEY is not configured"), {
      status: 500,
    });

  const { data } = await axios.get("https://serpapi.com/search", {
    params: {
      engine: "google_news",
      q: "top news today",
      api_key: env.serpApiKey,
      num: 24,
      hl: "en",
      gl: "us",
    },
  });

  const results = data.news_results || data.organic_results || [];
  const articles = results.filter((i) => i.link || i.url).map(mapItem);
  return { articles };
};

module.exports = { fetchNews, fetchTrending };
