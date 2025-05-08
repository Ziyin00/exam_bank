const jwt = require("jsonwebtoken");
const connection = require("../../db");

const answerQuestion = (req, res) => {
    const { question_id, answer } = req.body;
    const role = req.header("role");
    const token = req.header(`${role}-token`);

    if (!token || !role) {
        return res.status(400).json({ status: false, message: "No token or role provided" });
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

        if (!question_id || !answer) {
            return res.status(400).json({ status: false, message: "Missing fields" });
        }

        const sql = `INSERT INTO course_answers (question_id, teacher_id, answer) VALUES (?, ?, ?)`;
        connection.query(sql, [question_id, user_id, answer], (err, result) => {
            if (err) return res.status(500).json({ status: false, message: "DB error" });
            return res.status(200).json({ status: true, message: "Answer submitted" });
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ status: false, message: "Invalid or expired token" });
    }
};

module.exports = { answerQuestion };
