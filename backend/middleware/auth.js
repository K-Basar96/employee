// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redis from "../redisClient.js";

dotenv.config();
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export async function requireAuth(req, res, next) {
  try {
    // 🔑 Get token from cookie or Authorization header
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    // 🔑 Verify token
    const decoded = jwt.verify(token, ACCESS_SECRET);

    // 🔑 Get session from Redis
    const sessionKey = `session:${decoded.sid}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(401).json({ message: "Session expired" });
    }

    const { fingerprint } = JSON.parse(sessionData);

    // 🔑 Compare fingerprint (always from header)
    const clientFingerprint = req.headers["x-fingerprint"];
    if (!clientFingerprint || clientFingerprint !== fingerprint) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ Attach user info to request (so /auth/me can use it)
    req.user = { id: decoded.sub, sid: decoded.sid };
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
