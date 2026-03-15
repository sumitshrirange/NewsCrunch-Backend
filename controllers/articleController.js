const articleService = require("../services/articleService");
const { asyncHandler } = require("../middleware/errorMiddleware");

// POST /api/articles/summarize
const summarize = asyncHandler(async (req, res) => {
  const { url, thumbnail = "" } = req.body;
  if (!url)
    return res.status(400).json({ success: false, error: "URL is required" });

  const result = await articleService.summarize(req.user._id, url, thumbnail);
  res.json({ success: true, ...result });
});

// GET /api/articles
const list = asyncHandler(async (req, res) => {
  const result = await articleService.list(req.user._id, req.query);
  res.json({ success: true, ...result });
});

// GET /api/articles/stats
const getStats = asyncHandler(async (req, res) => {
  const result = await articleService.stats(req.user._id);
  res.json({ success: true, ...result });
});

// GET /api/articles/:id
const getOne = asyncHandler(async (req, res) => {
  const article = await articleService.getById(req.user._id, req.params.id);
  res.json({ success: true, article });
});

// DELETE /api/articles/:id
const remove = asyncHandler(async (req, res) => {
  await articleService.remove(req.user._id, req.params.id);
  res.json({ success: true, message: "Deleted" });
});

module.exports = { summarize, list, getStats, getOne, remove };
