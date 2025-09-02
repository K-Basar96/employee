import mysql from "mysql2/promise";
const pools = {}; 


async function findUser({ username, disecode, role }) {
  
  try {
    const dbConfig = role === 1 ? "DB1" : "DB2";

    if (!pools[dbConfig]) {
      pools[dbConfig] = mysql.createPool({
        host: process.env[`${dbConfig}_HOST`],
        user: process.env[`${dbConfig}_USER`],
        password: process.env[`${dbConfig}_PASS`],
        database: process.env[`${dbConfig}_NAME`],
      });
    }
    const db = pools[dbConfig];

    let rows = [];

    if (role === 1) {
      // Admin
      const [result] = await db.query("CALL sp_post_user_login(?)", [username]);
      rows = result[0];
    } else if (role === 2) {
      // School
      const query = `
        SELECT ul.id, s.district_id, d.code AS district_code, d.name AS district_name,
               s.circle_id, c.code AS circle_code, c.name AS circle_name, s.id AS school_id,
               s.disecode, s.name AS school_name, s.email AS school_email, s.landline AS school_landline,
               s.mobile AS school_mobile, ul.password
        FROM user_login ul
        JOIN school s ON s.disecode = ul.username
        JOIN district d ON d.id = s.district_id
        JOIN circle c ON c.id = s.circle_id
        WHERE ul.username = ?
          AND ul.teacher_id = 0
          AND s.isactive = '1'
          AND ul.isactive = '1'
      `;
      const [result] = await db.query(query, [disecode]);
      rows = result;
    } else if (role === 0) {
      // Teacher
      const [result] = await db.query("CALL sp_post_user_login(?)", [username]);
      rows = result[0];
    }
    return rows && rows.length > 0 ? { ...rows[0], source: dbConfig } : null;
  } catch (err) {
    console.error("Error finding user:", err.message);
    throw err;
  }
}

export { findUser };
