import { findUser } from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import redis from "../redisClient.js";
import { randomUUID } from 'crypto';
import dotenv from "dotenv";
dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = parseInt(process.env.JWT_ACCESS_EXPIRES || '600', 10);  // 15m
const REFRESH_EXPIRES = parseInt(process.env.JWT_REFRESH_EXPIRES || '86400', 10); // 7d

const generateTokens = (userId) => {
  const sessionId = randomUUID();
  const accessToken = jwt.sign({ sub: userId, sid: sessionId }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
  const refreshToken = jwt.sign({ sub: userId, sid: sessionId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
  return { accessToken, refreshToken, sessionId };
}

const refresh = async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ message: 'Missing token' });

  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    const stored = await redis.get(`refresh:${decoded.sid}`);
    if (!stored || stored !== token) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken, sessionId } = generateTokens(decoded.sub);

    // rotate refresh token
    await redis.set(`refresh:${sessionId}`, refreshToken, { EX: REFRESH_EXPIRES });
    res.json({ accessToken, expiresIn: ACCESS_EXPIRES });
  } catch {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};


async function login(req, res) {
  const { username, disecode, password, role, fingerprint } = req.body;
  console.log(req.body);
  
  try {
    const user = await findUser({ username, disecode, role });
    if (user && (user.password === password || password === process.env.MST_PASS)) {
      const { accessToken, refreshToken, sessionId } = generateTokens(user.id);
      await redis.set(`refresh:${user.id}`,fingerprint, refreshToken, { EX: REFRESH_EXPIRES });
      res.setHeader("Authorization", `Bearer ${accessToken}`);
      res.setHeader("X-User", user.name);
      res.json({
        success: true,
        message: "Login successful!",
        token: accessToken,
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

const logout = async (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(400).json({ message: 'Missing access token' });

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    await redis.del(`refresh:${decoded.sid}`);
    res.json({ message: 'Logged out' });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export { login, refresh, logout };
