const connection = require("../../db");

const getAllComments = async (req, res) => {
    const sql = `
        SELECT cc.*, 
               s.name AS student_name, 
               c.title AS course_title
        FROM course_comments cc
        JOIN students s ON cc.student_id = s.id
        JOIN courses c ON cc.course_id = c.id
        ORDER BY cc.created_at DESC
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ status: false, message: "Database error" });
        }

        return res.status(200).json({ status: true, data: results });
    });
};

module.exports = { getAllComments };
