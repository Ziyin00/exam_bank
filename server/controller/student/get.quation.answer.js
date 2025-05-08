const connection = require("../../db");
const jwt = require("jsonwebtoken");

const getStudentCourseQA = (req, res) => {
    const course_id = req.params.id;
    const role = req.header("role");
    const token = req.header(`${role}-token`);


    if (!course_id) {
        return res.status(400).json({ status: false, message: "Course ID is required" });
    }


    try {

        let secretKey;
        switch (role) {
            case "student":
                secretKey = process.env.STUDENT_KEY;
                break;
            case "teacher":
                secretKey = process.env.TEACHER_KEY;
                break;
            case "admin":
                secretKey = process.env.ADMIN_KEY;
                break;
            default:
                return res.status(400).json({ status: false, message: "Invalid role" });
        }

        // Verify the token
        const decoded = jwt.verify(token, secretKey);
        const user_id = decoded.id;

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

        connection.query(sql, [user_id, course_id], (err, result) => {
            if (err) return res.status(500).json({ status: false, message: "DB error" });
            return res.status(200).json({ status: true, data: result });
        });

    } catch (err) {
        console.error("JWT error:", err);
        return res.status(401).json({ status: false, message: "Invalid or expired token" });
    }
};

module.exports = { getStudentCourseQA };
