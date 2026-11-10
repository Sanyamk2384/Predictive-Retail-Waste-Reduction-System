import express from "express";
import env from "./config/env.js";
import cors from "cors";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import router from "./routes/index.js";
import { connectDB } from "./config/db.config.js";

export const app = express();

app.use(cors({ origin: env.client_url }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

// On Vercel this file is the entrypoint (server.js never runs), so make sure the
// DB is connected and config is present before any route touches it.
app.use("/api", async (req, res, next) => {
  try {
    if (!env.jwt_secret) throw new Error("JWT_SECRET is not configured");
    await connectDB();
    next();
  } catch (err) {
    console.error("Startup check failed:", err.message);
    res.status(503).json({ success: false, message: "Service unavailable: " + err.message });
  }
});

app.use("/api", router);

app.use(notFound);
app.use(errorHandler);

export default app;
