const connection = require("../../db");
const jwt = require("jsonwebtoken");

const getStudentCourseQA = (req, res) => {
    const token = req.header("s-token");
    const course_id = req.params.id;

    if (!token) {
        return res.status(401).json({ status: false, message: "No token provided" });
    }

    if (!course_id) {
        return res.status(400).json({ status: false, message: "Course ID is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.STUDENT_KEY);
        const student_id = decoded.id;

        const sql = `
            SELECT q.id AS question_id, q.question, q.created_at AS question_time,
                   s.name AS student_name,
                   a.answer, a.created_at AS answer_time,
                   t.name AS teacher_name
            FROM course_questions q
            JOIN students s ON q.student_id = s.id
            LEFT JOIN course_answers a ON q.id = a.question_id
            LEFT JOIN teachers t ON a.teacher_id = t.id
            WHERE q.student_id = ? AND q.course_id = ?
            ORDER BY q.created_at DESC
        `;

        connection.query(sql, [student_id, course_id], (err, result) => {
            if (err) return res.status(500).json({ status: false, message: "DB error" });
            return res.status(200).json({ status: true, data: result });
        });

    } catch (err) {
        console.error("JWT error:", err);
        return res.status(401).json({ status: false, message: "Invalid or expired token" });
    }
};

module.exports = { getStudentCourseQA };
