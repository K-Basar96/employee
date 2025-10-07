import mysql from "mysql2/promise";
let pools = {};

export async function getMediumList({ academic_year_id, school_id }) {
    try {
        const dbConfig = "DB3";
        if (!pools[dbConfig]) {
            pools[dbConfig] = mysql.createPool({
                host: process.env[`${dbConfig}_HOST`],
                user: process.env[`${dbConfig}_USER`],
                password: process.env[`${dbConfig}_PASS`],
                database: process.env[`${dbConfig}_NAME`],
            });
        }
        const db = pools[dbConfig];

        const query = `SELECT DISTINCT m.id, m.name from school_student ss JOIN medium m ON FIND_IN_SET(m.id, ss.medium_id) > 0
            WHERE ss.isactive=1 AND m.isactive=1 AND ss.academic_year_id = ? AND ss.school_id = ?
            `;
        const [rows] = await db.query(query, [academic_year_id, school_id]);
        return rows && rows.length > 0 ? rows : [];
    } catch (err) {
        console.error("Error finding mediums:", err.message);
        throw err;
    }
}

export async function getClassList({ academic_year_id, school_id, medium_id }) {
    try {
        const dbConfig = "DB3";
        if (!pools[dbConfig]) {
            pools[dbConfig] = mysql.createPool({
                host: process.env[`${dbConfig}_HOST`],
                user: process.env[`${dbConfig}_USER`],
                password: process.env[`${dbConfig}_PASS`],
                database: process.env[`${dbConfig}_NAME`],
            });
        }
        const db = pools[dbConfig];

        const query = `SELECT DISTINCT c.id, c.name FROM school_student ss JOIN class c ON FIND_IN_SET(c.id, ss.class_id) > 0
            WHERE ss.isactive=1 AND c.isactive=1 AND c.id > 0 AND c.id < 11 AND ss.academic_year_id = ? AND ss.school_id = ? AND ss.medium_id = ?  ORDER BY c.id
            `;
        const [rows] = await db.query(query, [academic_year_id, school_id, medium_id]);
        return rows && rows.length > 0 ? rows : [];
    } catch (err) {
        console.error("Error finding classes:", err.message);
        throw err;
    }
}

export async function getSectionList({ academic_year_id, school_id, medium_id, class_id }) {
    try {
        const dbConfig = "DB3";
        if (!pools[dbConfig]) {
            pools[dbConfig] = mysql.createPool({
                host: process.env[`${dbConfig}_HOST`],
                user: process.env[`${dbConfig}_USER`],
                password: process.env[`${dbConfig}_PASS`],
                database: process.env[`${dbConfig}_NAME`],
            });
        }
        const db = pools[dbConfig];

        const query = `
            SELECT DISTINCT s.id, s.code AS name FROM school_student ss
            JOIN section s ON FIND_IN_SET(s.id, ss.section_id) > 0
            WHERE ss.isactive = 1 
                AND s.isactive = 1 
                AND ss.academic_year_id = ?
                AND ss.school_id = ?
                AND ss.medium_id = ?
                AND ss.class_id = ?`
            ;
        const [rows] = await db.query(query, [academic_year_id, school_id, medium_id, class_id]);
        return rows && rows.length > 0 ? rows : [];
    } catch (err) {
        console.error("Error finding sections:", err.message);
        throw err;
    }
}

export async function schoollanguage({ academic_year_id, school_id, medium_id, class_id }) {
    try {
        const dbConfig = "DB3";
        if (!pools[dbConfig]) {
            pools[dbConfig] = mysql.createPool({
                host: process.env[`${dbConfig}_HOST`],
                user: process.env[`${dbConfig}_USER`],
                password: process.env[`${dbConfig}_PASS`],
                database: process.env[`${dbConfig}_NAME`],
            });
        }
        const db = pools[dbConfig];

        // Step 1: Fetch base class-subject-medium info
        const [baseRows] = await db.execute(`SELECT ss.academic_year_id, ss.school_id, ss.medium_id, ss.class_id,
            CASE WHEN cs.class_id < 9 THEN ml.first_language ELSE cs.first_language END AS first_language_id,
            CASE WHEN cs.class_id < 9 THEN ml.second_language ELSE cs.second_language END AS second_language_id,
            cs.third_language AS third_language_id,
            cs.opt_elec_subject AS opt_elec_subject_id,
            c.code AS class_name
        FROM school_student ss
        JOIN class_subject cs ON cs.class_id = ss.class_id
        JOIN medium_language ml ON ml.medium_id = ?
        JOIN class c ON c.id = ss.class_id
        WHERE 
            ss.academic_year_id = ? AND
            cs.class_id = ? AND
            ss.school_id = ? AND
            ss.medium_id = ? AND
            ss.isactive = 1 AND
            c.isactive = 1
        GROUP BY ss.academic_year_id, ss.school_id, ss.medium_id, ss.class_id,
                 ml.first_language, ml.second_language, cs.third_language, c.code
        ORDER BY ss.class_id`, [medium_id, academic_year_id, class_id, school_id, medium_id]);

        if (baseRows.length === 0) return [];

        // const classIds = baseRows.map(r => r.class_id);

        // Step 2: Fetch selected school languages
        const [selectedLangs] = await db.execute(`SELECT class_id, first_language, second_language, third_language, opt_elec_subject FROM school_language
        WHERE academic_year_id = ? AND school_id = ? AND class_id IN (?) AND medium_id = ?`, [academic_year_id, school_id, class_id, medium_id]);

        // Step 3: Aggregate all language IDs
        let totalLangIds = [];
        baseRows.forEach(row => {
            ['first_language_id', 'second_language_id', 'third_language_id', 'opt_elec_subject_id'].forEach(key => {
                if (row[key]) {
                    totalLangIds.push(...row[key].split(','));
                }
            });
        });
        const uniqueLangIds = [...new Set(totalLangIds)];

        // Step 4: Fetch all subjects
        const [allSubs] = await db.query(`SELECT id, name FROM subject WHERE id IN (?)`, [uniqueLangIds]);

        // Step 5: Map selected languages and names
        baseRows.forEach(row => {
            // Map selected school languages
            const selLang = selectedLangs.find(sl => sl.class_id === row.class_id);
            row.fl_id = selLang?.first_language || null;
            row.sl_id = selLang?.second_language || null;
            row.tl_id = selLang?.third_language || null;
            row.opt_id = selLang?.opt_elec_subject || null;

            // Helper to convert IDs to names
            ['first_language', 'second_language', 'third_language', 'opt_elec_subject'].forEach((field, idx) => {
                const idField = ['first_language_id', 'second_language_id', 'third_language_id', 'opt_elec_subject_id'][idx];
                if (row[idField]) {
                    const names = row[idField].split(',').map(id => {
                        const sub = allSubs.find(s => s.id == id);
                        return sub ? sub.name : null;
                    }).filter(Boolean);
                    row[field] = names.join(',');
                } else {
                    row[field] = null;
                }
            });
        });

        // await db.end();
        return baseRows[0];
    } catch (err) {
        console.error("Error finding classes:", err.message);
        throw err;
    }
}

export async function save_school_lang({ academic_year_id, school_id, medium_id, class_id, selectedLangs }) {
    //Insert school_language table
    // console.log(selectedLangs['fl_id']);
    const created = new Date().toISOString().slice(0, 10);
    const first_language_list = selectedLangs.fl_id;
    const second_language_list = selectedLangs.sl_id;
    const third_language_list = selectedLangs.tl_id;
    const optional_subject_list = selectedLangs.opt_id;
    const count1 = first_language_list ? first_language_list.split(",").length : 0;
    const count2 = second_language_list ? second_language_list.split(",").length : 0;
    const count3 = third_language_list ? third_language_list.split(",").length : 0;
    const count4 = optional_subject_list ? optional_subject_list.split(",").length : 0;

    try {
        const dbConfig = "DB3";
        if (!pools[dbConfig]) {
            pools[dbConfig] = mysql.createPool({
                host: process.env[`${dbConfig}_HOST`],
                user: process.env[`${dbConfig}_USER`],
                password: process.env[`${dbConfig}_PASS`],
                database: process.env[`${dbConfig}_NAME`],
            });
        }
        const pool = pools[dbConfig];
        const conn = await pool.getConnection();


        // 1️⃣ Insert/Update school_language
        if (first_language_list) {
            const [rows] = await conn.query(
                `SELECT id FROM school_language 
                 WHERE academic_year_id=? AND school_id=? AND medium_id=? AND class_id=?`,
                [academic_year_id, school_id, medium_id, class_id]
            );

            if (rows.length > 0) {
                await conn.query(
                    `UPDATE school_language 
                     SET first_language=?, second_language=?, third_language=?, opt_elec_subject=?, created=? 
                     WHERE academic_year_id=? AND school_id=? AND medium_id=? AND class_id=?`,
                    [
                        first_language_list,
                        second_language_list,
                        third_language_list,
                        optional_subject_list,
                        created,
                        academic_year_id,
                        school_id,
                        medium_id,
                        class_id,
                    ]
                );
            } else {
                await conn.query(
                    `INSERT INTO school_language 
                     (created, academic_year_id, school_id, medium_id, class_id, first_language, second_language, third_language, opt_elec_subject) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        created,
                        academic_year_id,
                        school_id,
                        medium_id,
                        class_id,
                        first_language_list,
                        second_language_list,
                        third_language_list,
                        optional_subject_list,
                    ]
                );
            }
        }

        // 2️⃣ Prepare school_student_language payload
        const arr2 = {
            created,
            academic_year_id,
            school_id,
            medium_id,
            class_id,
            first_language: count1 === 1 ? first_language_list : 0,
            second_language: count2 === 1 ? second_language_list : 0,
            third_language: count3 === 1 ? third_language_list : 0,
            opt_elec_subject: count4 === 1 ? optional_subject_list : 0,
            isactive: 1,
        };

        const [studLangRows] = await conn.query(
            `SELECT id FROM school_student_language 
             WHERE academic_year_id=? AND school_id=? AND medium_id=? AND class_id=? AND isactive=1`,
            [academic_year_id, school_id, medium_id, class_id]
        );

        let student_list = [];

        if (studLangRows.length > 0) {
            // update existing
            await conn.query(
                `UPDATE school_student_language 
                 SET first_language=?, second_language=?, third_language=?, opt_elec_subject=?, created=? 
                 WHERE academic_year_id=? AND school_id=? AND medium_id=? AND class_id=? AND isactive=1`,
                [
                    arr2.first_language,
                    arr2.second_language,
                    arr2.third_language,
                    arr2.opt_elec_subject,
                    created,
                    academic_year_id,
                    school_id,
                    medium_id,
                    class_id,
                ]
            );

            // find missing students (not yet in school_student_language)
            const [missing] = await conn.query(
                `SELECT student_id 
                 FROM school_student 
                 WHERE school_id=? AND medium_id=? AND class_id=? AND academic_year_id=? AND isactive=1
                   AND student_id NOT IN (
                     SELECT student_id FROM school_student_language
                     WHERE school_id=? AND medium_id=? AND class_id=? AND academic_year_id=? AND isactive=1
                   )`,
                [
                    school_id, medium_id, class_id, academic_year_id,
                    school_id, medium_id, class_id, academic_year_id
                ]
            );
            student_list = missing;
        } else {
            // new insert → fetch all students
            const [students] = await conn.query(
                `SELECT student_id 
                 FROM school_student 
                 WHERE class_id=? AND medium_id=? AND school_id=? AND academic_year_id=? AND isactive=1`,
                [class_id, medium_id, school_id, academic_year_id]
            );
            student_list = students;
        }

        // 3️⃣ Batch insert for missing students
        if (student_list.length > 0) {
            const values = student_list.map((s) => [
                arr2.created,
                arr2.school_id,
                arr2.medium_id,
                arr2.class_id,
                s.student_id,
                arr2.academic_year_id,
                arr2.first_language,
                arr2.second_language,
                arr2.third_language,
                arr2.opt_elec_subject,
                arr2.isactive,
            ]);

            await conn.query(
                `INSERT INTO school_student_language 
                 (created, school_id, medium_id, class_id, student_id, academic_year_id, first_language, second_language, third_language, opt_elec_subject, isactive) 
                 VALUES ?`,
                [values]
            );
        }

        await conn.commit();
        return { success: true, message: "School language saved successfully" };
    } catch (err) {
        await conn.rollback();
        console.error("Error saving school language:", err.message);
        return { success: false, message: "Save failed", error: err.message };
    }
}

export async function getStudentList({ academic_year_id, school_id, medium_id, class_id, section_id }) {
    try {
        const dbConfig = "DB3";
        if (!pools[dbConfig]) {
            pools[dbConfig] = mysql.createPool({
                host: process.env[`${dbConfig}_HOST`],
                user: process.env[`${dbConfig}_USER`],
                password: process.env[`${dbConfig}_PASS`],
                database: process.env[`${dbConfig}_NAME`],
            });
        }
        const db = pools[dbConfig];

        const query = `SELECT DISTINCT ss.school_id, ss.medium_id, ss.class_id, sl.first_language AS first_language_id, ss.roll_no, sec.code,
                sl.second_language AS second_language_id, sl.third_language AS third_language_id, sl.opt_elec_subject AS opt_elec_subject_id,
                GROUP_CONCAT(DISTINCT s1.name ORDER BY s1.id) AS first_language, GROUP_CONCAT(DISTINCT s2.name ORDER BY s2.id) AS second_language,
                GROUP_CONCAT(DISTINCT s3.name ORDER BY s3.id) AS third_language, GROUP_CONCAT(DISTINCT s4.name ORDER BY s4.id) AS opt_elec_subject, c.code AS class_name, 
                s.name AS student, _ssl.student_id, _ssl.second_language AS s_id, _ssl.first_language AS f_id, _ssl.third_language AS t_id, _ssl.opt_elec_subject AS opt_id
            FROM school_student ss
            LEFT JOIN school_student_language _ssl ON ss.student_id = _ssl.student_id AND _ssl.school_id = ss.school_id AND _ssl.academic_year_id = ?
            JOIN class c ON c.id = ss.class_id 
            JOIN student s ON s.id = ss.student_id
            JOIN section sec ON sec.id = ss.section_id
            LEFT JOIN school_language sl ON sl.school_id = ss.school_id AND sl.medium_id = ss.medium_id AND sl.class_id = ss.class_id AND sl.academic_year_id = ?
            LEFT JOIN subject s1 ON FIND_IN_SET(s1.id, sl.first_language) > 0
            LEFT JOIN subject s2 ON FIND_IN_SET(s2.id, sl.second_language) > 0
            LEFT JOIN subject s3 ON FIND_IN_SET(s3.id, sl.third_language) > 0
            LEFT JOIN subject s4 ON FIND_IN_SET(s4.id, sl.opt_elec_subject) > 0
            WHERE _ssl.student_id = s.id 
                AND _ssl.medium_id = ss.medium_id 
                AND _ssl.class_id = ss.class_id
                AND ss.academic_year_id = ?
                AND ss.school_id = ?
                AND ss.medium_id = ?
                AND ss.class_id = ?
                AND ss.section_id = ?
                AND s.isactive = 1 
                AND c.isactive = 1 
                AND ss.isactive = 1
            GROUP BY 
                ss.school_id, ss.medium_id, ss.class_id, _ssl.student_id, 
                sl.first_language, sl.second_language, sl.third_language, 
                sl.opt_elec_subject, c.code, s.name, 
                _ssl.second_language, _ssl.first_language, _ssl.third_language, _ssl.opt_elec_subject
            ORDER BY CAST(ss.roll_no AS SIGNED) ASC`
            ;

        const [rows] = await db.query(query, [
            academic_year_id, // for _ssl.academic_year_id
            academic_year_id, // for sl.academic_year_id
            academic_year_id, // for WHERE ss.academic_year_id
            school_id, medium_id, class_id, section_id
        ]);
        return rows && rows.length > 0 ? rows : [];
    } catch (err) {
        console.error("Error finding students:", err.message);
        throw err;
    }
}

export async function save_student_lang({ academic_year_id, school_id, medium_id, class_id, section_id, languageData }) {
    //Insert school_student_language table
    const created = new Date().toISOString().slice(0, 10);
    try {
        const dbConfig = "DB3";
        if (!pools[dbConfig]) {
            pools[dbConfig] = mysql.createPool({
                host: process.env[`${dbConfig}_HOST`],
                user: process.env[`${dbConfig}_USER`],
                password: process.env[`${dbConfig}_PASS`],
                database: process.env[`${dbConfig}_NAME`],
            });
        }
        const db = pools[dbConfig];
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // Loop through all students and update their language selections
            for (const lang of languageData) {
                const student_id = lang.student_id;
                if (!student_id || student_id <= 0) continue;

                const updateData = {
                    created,
                    first_language: lang.f_id || null,
                    second_language: lang.s_id || null,
                    third_language: lang.t_id || null,
                    opt_elec_subject: lang.opt_id || null,
                };

                // Build the SET clause dynamically
                const setClause = Object.keys(updateData)
                    .map((key) => `${key} = ?`)
                    .join(", ");
                const values = Object.values(updateData);

                const whereClause = "student_id = ? AND isactive = 1";
                values.push(student_id);

                const query = `
                    UPDATE school_student_language
                    SET ${setClause}
                    WHERE ${whereClause}
                `;
                await conn.query(query, values);
            }

            await conn.commit();
            conn.release();

            return { success: true, message: "Student languages updated successfully" };
        } catch (err) {
            await conn.rollback();
            conn.release();
            console.error("Transaction error:", err.message);
            return { success: false, message: "Failed to update student languages" };
        }
    } catch (err) {
        console.error("Connection error:", err.message);
        throw err;
    }
}
