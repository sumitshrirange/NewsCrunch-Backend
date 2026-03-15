const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    originalUrl: { type: String, required: true, trim: true },
    title: { type: String, default: "Untitled Article" },
    thumbnail: { type: String, default: "" },
    originalContent: { type: String, default: "" },
    summary: { type: String, required: true },
    keyPoints: [{ type: String }],
    category: { type: String, default: "General" },
    sourceDomain: { type: String, default: "" },
    readTime: { type: Number, default: 1 },
    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral"],
      default: "neutral",
    },
  },
  { timestamps: true },
);

articleSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Article", articleSchema);
