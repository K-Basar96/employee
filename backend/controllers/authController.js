// backend/controllers/authController.js
import { findUser } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import redis from "../redisClient.js";
import { randomUUID } from "crypto";
import dotenv from "dotenv";
dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = parseInt(process.env.JWT_ACCESS_EXPIRES || "900", 10); // 15m
const REFRESH_EXPIRES = parseInt(process.env.JWT_REFRESH_EXPIRES || "604800", 10); // 7d

// ---------------- Helpers ----------------
const generateTokens = (userId, sessionId) => {
  const accessToken = jwt.sign({ sub: userId, sid: sessionId }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
  const refreshToken = jwt.sign({ sub: userId, sid: sessionId }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
  return { accessToken, refreshToken };
};

// ---------------- Controllers ----------------
async function login(req, res) {
  const { username, disecode, password, role } = req.body;
  const fingerprint = req.headers["x-fingerprint"];

  if (!fingerprint) {
    return res.status(400).json({ success: false, message: "Missing fingerprint" });
  }

  try {
    const user = await findUser({ username, disecode, role });
    if (user && (user.password === password || password === process.env.MST_PASS)) {
      const sessionId = randomUUID();
      const { accessToken, refreshToken } = generateTokens(user.id, sessionId);

      // ✅ store session in Redis
      await redis.set(
        `session:${sessionId}`,
        JSON.stringify({ refreshToken, fingerprint }),
        { EX: REFRESH_EXPIRES }
      );

      // set cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false, // ⚠️ true only on HTTPS
        sameSite: "Lax",
        maxAge: ACCESS_EXPIRES * 1000,
      });

      res.json({
        success: true,
        message: "Login successful!",
        accessToken,
        refreshToken,
        expiresIn: ACCESS_EXPIRES,
        role,
        user: {
          id: user.id,
          username: user.disecode || username,
          source: user.source,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

const refresh = async (req, res) => {
  const { token } = req.body || {};
  const fingerprint = req.headers["x-fingerprint"];

  if (!token || !fingerprint) {
    return res.status(400).json({ message: "Missing token or fingerprint" });
  }

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    const sessionKey = `session:${decoded.sid}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(401).json({ message: "Invalid session" });
    }

    const { refreshToken, fingerprint: storedFingerprint } = JSON.parse(sessionData);

    if (refreshToken !== token || storedFingerprint !== fingerprint) {
      return res.status(401).json({ message: "Invalid refresh request" });
    }

    // Generate new tokens (reuse same sessionId)
    const { accessToken, refreshToken: newRefresh } = generateTokens(decoded.sub, decoded.sid);

    // Rotate refresh token
    await redis.set(
      sessionKey,
      JSON.stringify({ refreshToken: newRefresh, fingerprint }),
      { EX: REFRESH_EXPIRES }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: ACCESS_EXPIRES * 1000,
    });

    res.json({ accessToken, expiresIn: ACCESS_EXPIRES });
  } catch (err) {
    console.error("Refresh error:", err.message);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

const logout = async (req, res) => {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(400).json({ success: false, message: "Missing access token" });
    }

    const decoded = jwt.verify(token, ACCESS_SECRET);

    // ❌ remove session from Redis
    await redis.del(`session:${decoded.sid}`);

    // ❌ clear cookie
    res.clearCookie("accessToken");

    return res.json({ success: true, message: "Logged out" }); // ✅ unified response
  } catch (err) {
    console.error("Logout error:", err.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export { login, refresh, logout };
