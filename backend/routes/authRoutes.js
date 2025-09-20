import express from "express";
import { login, refresh, logout } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ---- Auth Routes ----
router.post("/login", login);
router.post("/refresh", refresh); // refresh doesn’t need requireAuth, it uses refreshToken cookie
router.post("/logout", requireAuth, logout);

export default router;
