import express from "express";
import { school, classes, searching, student, } from "../controllers/languageController.js";
import { requireAuth } from "../../middleware/auth.js";

const router = express.Router();

// ---- Auth Routes ----
router.get("/school", requireAuth, school);
router.post("/school/class", requireAuth, classes);
router.post("/school/search", requireAuth, searching);
router.get("/student", requireAuth, student);

export default router;
