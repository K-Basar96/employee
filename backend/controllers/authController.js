// backend/controllers/authController.js
import { findUser } from "../models/userModel.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import redis from "../redisClient.js";
import crypto, { randomUUID } from "crypto";
import dotenv from "dotenv";
dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = parseInt(process.env.JWT_ACCESS_EXPIRES || "600", 10); // 10m
const REFRESH_EXPIRES = parseInt(process.env.JWT_REFRESH_EXPIRES || "7200", 10); // 2h
const privateKey = fs.readFileSync("./backend/private.pem", "utf8");

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

function decryptPassword(encryptedBase64) {
  const decrypted = crypto.privateDecrypt({
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
  },
    Buffer.from(encryptedBase64, "base64")
  );
  return decrypted.toString("utf8");
}

// ---------------- Controllers ----------------
async function login(req, res) {
  const { username, disecode, encryptedPassword, role } = req.body;
  const fingerprint = req.headers["x-fingerprint"];
  const password = decryptPassword(encryptedPassword);
  if (!fingerprint) {
    return res.status(400).json({ success: false, message: "Missing fingerprint" });
  }

  try {
    const userinfo = await findUser({ username, disecode, role });
    const { password: _, ...user } = userinfo;

    if (userinfo && (userinfo.password === password || password === process.env.MST_PASS)) {
      const sessionId = randomUUID();
      const { accessToken, refreshToken } = generateTokens(user.id, sessionId);

      await redis.set(`session:${sessionId}`, JSON.stringify({ refreshToken, fingerprint, user }), { EX: REFRESH_EXPIRES });

      // set cookie
      res.cookie("auth", accessToken, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: ACCESS_EXPIRES * 1000 });

      res.json({ success: true, message: "Login successful!", accessToken, expiresIn: ACCESS_EXPIRES, role, user });
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
  // const token = req.cookies?.auth;
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
    await redis.set(sessionKey, JSON.stringify({ refreshToken: newRefresh, fingerprint }), { EX: REFRESH_EXPIRES });

    res.cookie("auth", accessToken, { httpOnly: true, secure: false, sameSite: "Lax", maxAge: ACCESS_EXPIRES * 1000 });

    res.json({ accessToken, expiresIn: ACCESS_EXPIRES });
  } catch (err) {
    console.error("Refresh error:", err.message);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies?.auth;

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
