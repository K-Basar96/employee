import express from "express";
import { school, classes, sections, searching, school_save, student, student_save } from "../controllers/languageController.js";
import { requireAuth } from "../../middleware/auth.js";

const router = express.Router();

// ---- Auth Routes ----
router.get("/school", requireAuth, school);
router.post("/school/class", requireAuth, classes);
router.post("/school/section", requireAuth, sections);
router.post("/school/search", requireAuth, searching);
router.post("/school/save", requireAuth, school_save);
router.post("/student", requireAuth, student);
router.post("/student/save", requireAuth, student_save);

export default router;
