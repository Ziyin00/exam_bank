const connection = require("../../db");

const getAllQuestionsCount = (req, res) => {
    const sql = `SELECT COUNT(*) AS total FROM course_questions`;

    connection.query(sql, (err, result) => {
        if (err) {
            console.error("DB error:", err.message);
            return res.status(500).json({ status: false, message: "Database error" });
        }

        return res.status(200).json({
            status: true,
            total_questions: result[0].total
        });
    });
};

module.exports = { getAllQuestionsCount };
