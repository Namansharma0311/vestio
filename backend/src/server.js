import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { initDb } from "./db.js";
import { uploadDirPath } from "./storage.js";
import authRoutes from "./routes/auth.js";
import clothesRoutes from "./routes/clothes.js";
import outfitsRoutes from "./routes/outfits.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:4000", "capacitor://localhost", "http://localhost", "https://localhost"];

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith("capacitor://")) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts — please try again later" },
});

app.use(limiter);
app.use(express.json());
app.use("/uploads", express.static(uploadDirPath));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/clothes", clothesRoutes);
app.use("/api/outfits", outfitsRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const musicCache = {};

const TRENDING_CACHE_TTL = 30 * 60 * 1000;
let trendingCache = { data: null, ts: 0 };

app.get("/api/music/trending", async (req, res) => {
  try {
    const now = Date.now();
    if (trendingCache.data && now - trendingCache.ts < TRENDING_CACHE_TTL) {
      return res.json(trendingCache.data);
    }

    const [usRes, inRes] = await Promise.all([
      fetch("https://itunes.apple.com/us/rss/topsongs/limit=25/json"),
      fetch("https://itunes.apple.com/in/rss/topsongs/limit=25/json"),
    ]);
    const usData = await usRes.json();
    const inData = await inRes.json();

    function parseFeed(data) {
      const entries = data?.feed?.entry || [];
      return entries.map((e) => ({
        track: e.title?.label || "",
        artist: e["im:artist"]?.label || "",
        artwork: (e["im:image"]?.slice(-1)?.[0]?.label || "").replace("170x170", "600x600"),
        url: e.link?.attributes?.href || "",
        genre: e.category?.attributes?.label || "",
      }));
    }

    const us = parseFeed(usData).map((s) => ({ ...s, region: "US" }));
    const inc = parseFeed(inData).map((s) => ({ ...s, region: "IN" }));

    const result = { us, in: inc, fetchedAt: new Date().toISOString() };
    trendingCache = { data: result, ts: now };
    res.json(result);
  } catch (err) {
    console.error("Trending fetch error:", err);
    res.json({ us: [], in: [], fetchedAt: null });
  }
});

app.get("/api/music/search", async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q) return res.status(400).json({ error: "q is required" });
    const cacheKey = `${type || "artist"}:${q}`;
    if (musicCache[cacheKey]) return res.json(musicCache[cacheKey]);

    let url = null;

    if (type === "track") {
      const apiRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=1`);
      const data = await apiRes.json();
      if (data.results?.[0]?.artworkUrl100) {
        url = data.results[0].artworkUrl100.replace("100x100", "600x600");
      }
    } else {
      const apiRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=1`);
      const data = await apiRes.json();
      if (data.results?.[0]?.artworkUrl100) {
        url = data.results[0].artworkUrl100.replace("100x100", "600x600");
      }
    }

    const result = { url };
    musicCache[cacheKey] = result;
    res.json(result);
  } catch (err) {
    console.error("Music search error:", err);
    res.json({ url: null });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Unexpected server error" });
});

await initDb();
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Wardrobe API running on http://localhost:${PORT}`);
  console.log(`Using SQLite database — see backend/data/wardrobe.db`);
  console.log(`Using mock storage (local disk) — see backend/src/storage.js to swap in Cloudinary`);
});
