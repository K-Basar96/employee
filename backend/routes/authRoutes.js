import express from "express";
import { login, refresh, logout } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// ---- Auth Routes ----
router.post("/login", login);
router.post("/refresh", refresh); // refresh doesn’t need requireAuth, it uses refreshToken cookie
router.post("/logout", requireAuth, logout);

// Get logged-in user
// router.get("/me", requireAuth, (req, res) => {
//   if (!req.user) {
//     return res.status(401).json({ success: false, message: "Unauthorized" });
//   }
//   res.json({ success: true, user: req.user });
// });

export default router;
