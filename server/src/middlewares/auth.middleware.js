import jwt from "jsonwebtoken";
import env from "../config/env.js";

// TEMPORARY DEMO BYPASS — on by default. Set env AUTH_BYPASS=false to re-enable JWT auth.
// While on, requests without a valid token are let through as a demo user.
const AUTH_BYPASS = process.env.AUTH_BYPASS !== "false";
const DEMO_USER = { id: null, email: "demo@example.com" };

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    if (AUTH_BYPASS) {
      req.user = DEMO_USER;
      return next();
    }
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, env.jwt_secret);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (error) {
    if (AUTH_BYPASS) {
      req.user = DEMO_USER;
      return next();
    }
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
