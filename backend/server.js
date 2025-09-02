import express from "express";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;


// ---- Middleware ----
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../dist")));

// ---- Routes ----
app.use("/auth", authRoutes);

// ---- Captcha ----
app.get("/captcha", (req, res) => {
  const captcha = Math.floor(100000 + Math.random() * 900000);
  res.json({ captcha });
});

// ---- React Router catch-all ----
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`🚀 Auth service running at http://localhost:${PORT}`);
});
