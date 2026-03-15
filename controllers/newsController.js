const newsService = require("../services/newsService");
const { asyncHandler } = require("../middleware/errorMiddleware");

// GET /api/news?q=&category=&page=
const getFeed = asyncHandler(async (req, res) => {
  const result = await newsService.fetchNews(req.query);
  res.json({ success: true, ...result });
});

// GET /api/news/trending
const getTrending = asyncHandler(async (req, res) => {
  const result = await newsService.fetchTrending();
  res.json({ success: true, ...result });
});

module.exports = { getFeed, getTrending };
