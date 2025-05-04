const connection = require("../../db");
const jwt = require("jsonwebtoken");

const getStudentAnswerCount = (req, res) => {
    const token = req.header("s-token");

    if (!token) {
        return res.status(401).json({ status: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.STUDENT_KEY);
        const student_id = decoded.id;

        const sql = `
            SELECT COUNT(a.id) AS answer_count
            FROM course_questions q
            JOIN course_answers a ON q.id = a.question_id
            WHERE q.student_id = ?
        `;

        connection.query(sql, [student_id], (err, result) => {
            if (err) {
                console.error("DB error:", err.message);
                return res.status(500).json({ status: false, message: "Database error" });
            }

            return res.status(200).json({
                status: true,
                answer_count: result[0].answer_count
            });
        });

    } catch (err) {
        console.error("JWT error:", err.message);
        return res.status(401).json({ status: false, message: "Invalid or expired token" });
    }
};

module.exports = { getStudentAnswerCount };
