// backend/controllers/authController.js
import { getMediumList, getClassList, schoollanguage, save_school_lang } from "../models/languageModel.js";
import jwt from "jsonwebtoken";
import redis from "../../redisClient.js";
import dotenv from "dotenv";
dotenv.config();

// ---------------- Controllers ----------------
async function school(req, res) {
    let academic_year_id = 8, school_id;
    try {
        const token = req.cookies?.auth;
        const x_fingerprint = req.headers["x-fingerprint"];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const sessionKey = `session:${decoded.sid}`;
            const sessionData = await redis.get(sessionKey);
            const sessionObj = JSON.parse(sessionData);
            school_id = sessionObj.user.school_id;
            school_id = 447;
            const rows = await getMediumList({ academic_year_id, school_id });
            res.json({ success: true, mediums: rows });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

async function classes(req, res) {
    let academic_year_id = 8, school_id;
    let medium_id = req.body.medium_id;
    try {
        const token = req.cookies?.auth;
        const x_fingerprint = req.headers["x-fingerprint"];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const sessionKey = `session:${decoded.sid}`;
            const sessionData = await redis.get(sessionKey);
            const sessionObj = JSON.parse(sessionData);
            school_id = sessionObj.user.school_id;
            school_id = 447;
            const rows = await getClassList({ academic_year_id, school_id, medium_id });
            res.json({ success: true, classes: rows });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

async function searching(req, res) {
    let medium_id = req.body.medium_id, class_id = req.body.class_id, academic_year_id = 8, school_id;
    try {
        const token = req.cookies?.auth;
        const x_fingerprint = req.headers["x-fingerprint"];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const sessionKey = `session:${decoded.sid}`;
            const sessionData = await redis.get(sessionKey);
            const sessionObj = JSON.parse(sessionData);
            school_id = sessionObj.user.school_id;
            school_id = 447;
            const rows = await schoollanguage({ academic_year_id, school_id, medium_id, class_id });
            res.json({ success: true, result: rows });
        }
    } catch (err) {
        console.log(err);
        res.status(403).json({ success: false, message: "Forbidden" });
    }
}

async function school_save(req, res) {
    let school_id;
    let academic_year_id = req.body.languageData.academic_year_id;
    let medium_id = req.body.languageData.medium_id;
    let class_id = req.body.languageData.class_id;
    let selectedLangs = {
        fl_id: req.body.languageData.fl_id,
        sl_id: req.body.languageData.sl_id,
        tl_id: req.body.languageData.tl_id,
        opt_id: req.body.languageData.opt_id
    };

    try {
        const token = req.cookies?.auth;
        const x_fingerprint = req.headers["x-fingerprint"];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const sessionKey = `session:${decoded.sid}`;
            const sessionData = await redis.get(sessionKey);
            const sessionObj = JSON.parse(sessionData);
            school_id = sessionObj.user.school_id;
            school_id = 447;
            const rows = await save_school_lang({ academic_year_id, school_id, medium_id, class_id, selectedLangs });
            res.json({ success: true, result: rows });
        }
    } catch (err) {
        console.log(err);
        res.status(403).json({ success: false, message: "Forbidden" });
    }
}

async function student(req, res) { }


export { school, classes, searching, school_save, student };
