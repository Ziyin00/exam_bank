const jwt = require("jsonwebtoken");
const connection = require("../../db");

const askQuestion = async (req, res) => {
    const { course_id, question } = req.body;
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

        // Validate the course ID and question
        if (!course_id || !question) {
            return res.status(400).json({ status: false, message: "Missing fields" });
        }

        // Insert the question into the database
        const sql = `INSERT INTO course_questions (course_id, student_id, question) VALUES (?, ?, ?)`;
        connection.query(sql, [course_id, user_id, question], (err, result) => {
            if (err) return res.status(500).json({ status: false, message: "DB error" });
            return res.status(200).json({ status: true, message: "Question submitted" });
        });
    } catch (err) {
        console.log(err.message);
        return res.status(400).json({ status: false, error: "Invalid or expired token" });
    }
};

module.exports = { askQuestion };
