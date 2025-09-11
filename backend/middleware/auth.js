// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import redis from "../redisClient.js";

dotenv.config();
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

export async function requireAuth(req, res, next) {
    try {
        const token = req.cookies?.auth;
        const clientFingerprint = req.headers["x-fingerprint"];

        if (!token) {
            return res.status(401).json({ message: "No access token provided" });
        }
        const decoded = jwt.verify(token, ACCESS_SECRET);
        const sessionKey = `session:${decoded.sid}`;
        const sessionData = await redis.get(sessionKey);
        const { fingerprint } = JSON.parse(sessionData);

        if (!sessionData) {
            return res.status(401).json({ message: "Session expired" });
        }
        if (!clientFingerprint || clientFingerprint !== fingerprint) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = { id: decoded.sub, sid: decoded.sid };
        next();
    } catch (err) {
        console.error("Auth error:", err.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
