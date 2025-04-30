const jwt = require("jsonwebtoken");
const connection = require("../../db");

const askQuestion = async (req, res) => {
    const { course_id, question } = req.body;
    const token = req.header("token");

    if (!token) {
        return res.status(400).json({ status: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.STUDENT_KEY);
        const student_id = decoded.id;

        if (!course_id || !question) {
            return res.status(400).json({ status: false, message: "Missing fields" });
        }

        const sql = `INSERT INTO course_questions (course_id, student_id, question) VALUES (?, ?, ?)`;
        connection.query(sql, [course_id, student_id, question], (err, result) => {
            if (err) return res.status(500).json({ status: false, message: "DB error" });
            return res.status(200).json({ status: true, message: "Question submitted" });
        });
    } catch (err) {
        console.log(err.message);
        return res.status(400).json({ status: false, error: "Invalid or expired token" });
    }
};

module.exports = { askQuestion };
