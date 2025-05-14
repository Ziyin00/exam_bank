const connection = require("../../db");
const jwt = require("jsonwebtoken");

const getStudentAnswerCount = (req, res) => {
    const role = req.header("role");
    const token = req.header(`${role}-token`);

    if (!token || !role) {
        return res.status(400).json({ status: false, message: "No token or role provided" });
    }

    try {
        // Determine the correct secret key based on the role
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
            SELECT COUNT(a.id) AS answer_count
            FROM course_questions q
            JOIN course_answers a ON q.id = a.question_id
            WHERE q.student_id = ?
        `;

        connection.query(sql, [user_id], (err, result) => {
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
