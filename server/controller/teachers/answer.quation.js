const jwt = require("jsonwebtoken");
const connection = require("../../db");

const answerQuestion = (req, res) => {
    const { question_id, answer } = req.body;
    const token = req.header("t-token");

    if (!token) {
        return res.status(400).json({ status: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.TEACHER_KEY);
        const teacher_id = decoded.id;

        if (!question_id || !answer) {
            return res.status(400).json({ status: false, message: "Missing fields" });
        }

        const sql = `INSERT INTO course_answers (question_id, teacher_id, answer) VALUES (?, ?, ?)`;
        connection.query(sql, [question_id, teacher_id, answer], (err, result) => {
            if (err) return res.status(500).json({ status: false, message: "DB error" });
            return res.status(200).json({ status: true, message: "Answer submitted" });
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ status: false, message: "Invalid or expired token" });
    }
};

module.exports = { answerQuestion };
