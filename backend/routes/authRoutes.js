import express from "express";
const app = express();
const router = express.Router();
import {login,refresh, logout } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

// Login → handled in controller
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Get logged-in user (session check)
router.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

export default router;
