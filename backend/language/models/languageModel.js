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
        const dbConfig = "DB2";
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

        const classIds = baseRows.map(r => r.class_id);

        // Step 2: Fetch selected school languages
        const [selectedLangs] = await db.execute(`SELECT class_id, first_language, second_language, third_language, opt_elec_subject FROM school_language
        WHERE academic_year_id = ? AND school_id = ? AND class_id IN (?) AND medium_id = ?`, [academic_year_id, school_id, classIds, medium_id]);

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