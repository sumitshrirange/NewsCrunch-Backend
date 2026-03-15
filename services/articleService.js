const Article = require("../models/Article");
const { scrapeArticle } = require("./scraperService");
const { summarizeArticle } = require("./aiService");

const summarize = async (userId, url, thumbnail = "") => {
  // Validate URL
  const parsed = new URL(url); // throws on invalid
  if (!["http:", "https:"].includes(parsed.protocol))
    throw Object.assign(new Error("Only HTTP/HTTPS URLs are supported"), {
      status: 400,
    });

  // Per-user cache hit
  const existing = await Article.findOne({ user: userId, originalUrl: url });
  if (existing) {
    if (thumbnail && !existing.thumbnail) existing.thumbnail = thumbnail;
    await existing.save();
    return { article: existing, cached: true };
  }

  // Scrape
  const scraped = await scrapeArticle(url);
  if (!scraped.content || scraped.content.length < 100)
    throw Object.assign(
      new Error(
        "Could not extract content. The page may require JavaScript or have bot protection.",
      ),
      { status: 422 },
    );

  // AI summarise
  const ai = await summarizeArticle(scraped.title, scraped.content);

  const article = await Article.create({
    user: userId,
    originalUrl: url,
    title: scraped.title,
    thumbnail,
    originalContent: scraped.content.slice(0, 2000),
    summary: ai.summary,
    keyPoints: ai.keyPoints,
    category: ai.category,
    sentiment: ai.sentiment,
    readTime: ai.readTime,
    sourceDomain: scraped.sourceDomain,
  });

  return { article, cached: false };
};

const list = async (
  userId,
  { page = 1, limit = 12, category, search } = {},
) => {
  const skip = (page - 1) * limit;
  const filter = { user: userId };
  if (category && category !== "All") filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { summary: { $regex: search, $options: "i" } },
    ];
  }

  const [articles, total] = await Promise.all([
    Article.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-originalContent"),
    Article.countDocuments(filter),
  ]);

  return {
    articles,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    },
  };
};

const getById = async (userId, id) => {
  const article = await Article.findOne({ _id: id, user: userId });
  if (!article)
    throw Object.assign(new Error("Article not found"), { status: 404 });
  await article.save();
  return article;
};

const remove = async (userId, id) => {
  const article = await Article.findOneAndDelete({ _id: id, user: userId });
  if (!article)
    throw Object.assign(new Error("Article not found"), { status: 404 });
  return article;
};

const stats = async (userId) => {
  const [total, byCategory, recent] = await Promise.all([
    Article.countDocuments({ user: userId }),
    Article.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Article.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title category sentiment createdAt thumbnail"),
  ]);
  return { total, byCategory, recent };
};

module.exports = { summarize, list, getById, remove, stats };
