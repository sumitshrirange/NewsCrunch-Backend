require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const env = require("./config/env");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const newsRoutes = require("./routes/newsRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

// Validate required env vars before anything else
env.validate();

connectDB();

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/news", newsRoutes);

app.get("/", (req, res) => {
  res.send("Backend is Running...");
});

// ── Global error handler ───────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ───────────────────────────────────────────────────────────────────
// app.listen(env.port, () => console.log(`Server is running on port ${env.port}`)),
  
module.exports = app;
