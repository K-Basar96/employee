import express from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import jwt from "jsonwebtoken";
import redis from "./redisClient.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true, }));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../dist")));

// ---- Routes ----
app.use("/auth", authRoutes);

// ---- Captcha ----
app.get("/captcha", async (req, res) => {
    try {
        const token = req.cookies?.auth;
        const x_fingerprint = req.headers["x-fingerprint"];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const sessionKey = `session:${decoded.sid}`;
            const sessionData = await redis.get(sessionKey);
            const sessionObj = JSON.parse(sessionData);
            if (sessionData && x_fingerprint && sessionObj.fingerprint === x_fingerprint) {
                return res.json({ redirect: true, user: sessionObj.user });
            }
        }

        const captcha = Math.floor(10 + Math.random() * 90);
        res.json({ captcha });
    } catch (err) {
        const captcha = Math.floor(10 + Math.random() * 90);
        res.json({ captcha });
    }
});

// ---- React Router catch-all ----
app.get(/.*/, (req, res) => {
    console.log("Serving index.html");
    // res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// ---- Start server ----
app.listen(PORT, () => {
    console.log(`🚀 Auth service running at http://localhost:${PORT}`);
});
