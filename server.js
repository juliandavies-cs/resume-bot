import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { embedResume } from "./embedResume.js";
import { answerQuestionFullResume } from "./queryResume.js";

export function createRateLimiter({
  windowMs = 60_000,
  maxRequests = 20,
  message = "Too many requests. Please try again in a minute.",
} = {}) {
  const requests = new Map();

  return (req, res, next) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const ip =
      (Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    const now = Date.now();
    const timestamps = requests.get(ip) || [];
    const recent = timestamps.filter((timestamp) => now - timestamp < windowMs);

    if (recent.length >= maxRequests) {
      return res.status(429).json({ error: message });
    }

    recent.push(now);
    requests.set(ip, recent);
    next();
  };
}

export function createApp({ embedOnStartup = true, rateLimit = {} } = {}) {
  const app = express();
  app.set("trust proxy", 1);
  app.use(cors());
  app.use(express.json());
  app.use(express.static("public"));

  const limiter = createRateLimiter({
    windowMs: 60_000,
    maxRequests: 20,
    ...rateLimit,
  });

  let vectors = [];
  let resumeEmbedded = false;

  const initializeResume = async () => {
    try {
      vectors = await embedResume();
      console.log("Resume embedded");
      resumeEmbedded = true;
    } catch (error) {
      console.error("Error embedding resume:", error);
      resumeEmbedded = false;
    }
  };

  if (embedOnStartup) {
    initializeResume();
  }

  app.use((req, res, next) => {
    if (req.method === "GET" && (req.path === "/" || req.path === "/index.html")) {
      console.log("Page loaded.");
    }
    next();
  });

  app.post("/chat", limiter, async (req, res) => {
    try {
      const { message } = req.body;

      if (!message || typeof message !== "string" || !message.trim()) {
        return res.status(400).json({ error: "Please provide a message." });
      }

      const reply = await answerQuestionFullResume(message.trim());
      return res.json({ reply });
    } catch (error) {
      console.error("Error handling /chat request:", error);
      return res.status(500).json({ reply: "An error occurred while processing your request." });
    }
  });

  app.get("/status", (req, res) => {
    res.json({ ready: resumeEmbedded });
  });

  return {
    app,
    initializeResume,
    getResumeStatus: () => resumeEmbedded,
  };
}

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMainModule) {
  const { app } = createApp();
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
}
