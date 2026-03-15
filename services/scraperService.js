const axios = require("axios");
const cheerio = require("cheerio");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

const TITLE_SELECTORS = [
  "h1.article-title",
  "h1.post-title",
  "h1.entry-title",
  "article h1",
  ".article-header h1",
  'meta[property="og:title"]',
  "h1",
  "title",
];

const CONTENT_SELECTORS = [
  "article",
  ".article-body",
  ".article-content",
  ".post-content",
  ".entry-content",
  ".story-body",
  ".news-body",
  "main",
  '[class*="article"]',
  '[class*="content"]',
  '[class*="story"]',
];

/**
 * Scrape title + body text from a public URL.
 * @param {string} url
 * @returns {{ title: string, content: string, sourceDomain: string }}
 */
const scrapeArticle = async (url) => {
  const response = await axios.get(url, {
    headers: HEADERS,
    timeout: 15000,
    maxRedirects: 5,
  });
  const $ = cheerio.load(response.data);

  $(
    "script, style, nav, footer, header, aside, .ad, .advertisement, iframe, noscript",
  ).remove();

  // Title
  let title = "";
  for (const sel of TITLE_SELECTORS) {
    const el = $(sel).first();
    const text = sel.includes("meta") ? el.attr("content") : el.text();
    if (text?.trim().length > 5) {
      title = text.trim();
      break;
    }
  }

  // Body
  let content = "";
  for (const sel of CONTENT_SELECTORS) {
    const text = $(sel).first().text().trim();
    if (text.length > 200) {
      content = text;
      break;
    }
  }
  if (content.length < 200) {
    const paras = [];
    $("p").each((_, el) => {
      const t = $(el).text().trim();
      if (t.length > 50) paras.push(t);
    });
    content = paras.join("\n\n");
  }

  content = content
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 8000);

  return {
    title: title || "Untitled Article",
    content,
    sourceDomain: new URL(url).hostname.replace("www.", ""),
  };
};

module.exports = { scrapeArticle };
