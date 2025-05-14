const jwt = require("jsonwebtoken");
const connection = require("../../db");

const answerQuestion = (req, res) => {
    // 1. WHAT IS IN req.body?
    console.log("[BACKEND answerQuestion] Received body:", req.body);
    const { question_id, answer } = req.body; // It expects 'question_id' and 'answer'

    const role = req.header("role");
    const token = req.header(`${role}-token`);

    if (!token || !role) {
        return res.status(400).json({ status: false, message: "No token or role provided" });
    }

    try {
        let secretKey;
        switch (role) {
            // ... (secret key logic) ...
            case "teacher": // Assuming the one answering is a teacher
                secretKey = process.env.TEACHER_KEY;
                break;
            case "admin": // Or an admin
                secretKey = process.env.ADMIN_KEY;
                break;
            default: // If a student tries to answer, this might be an issue
                return res.status(403).json({ status: false, message: "Unauthorized: Only teachers or admins can answer." });
        }

        const decoded = jwt.verify(token, secretKey);
        const user_id = decoded.id; // This is the teacher_id or admin_id

        if (!question_id || !answer) {
            return res.status(400).json({ status: false, message: "Missing question ID or answer content" });
        }
        if (typeof answer !== 'string' || answer.trim() === "") {
            return res.status(400).json({ status: false, message: "Answer content cannot be empty." });
        }


        // 2. VALUES BEING INSERTED
        console.log("[BACKEND answerQuestion] Attempting to insert:", { question_id, teacher_id: user_id, answer });

        const sql = `INSERT INTO course_answers (question_id, teacher_id, answer) VALUES (?, ?, ?)`;
        connection.query(sql, [question_id, user_id, answer], (err, result) => {
            if (err) {
                // 3. ACTUAL DATABASE ERROR
                console.error("[BACKEND answerQuestion] DATABASE INSERT ERROR:", err);
                return res.status(500).json({ status: false, message: "DB error submitting answer. See server logs." });
            }
            console.log("[BACKEND answerQuestion] Insert successful:", result);
            return res.status(200).json({ status: true, message: "Answer submitted successfully" });
        });
    } catch (err) {
        console.error("[BACKEND answerQuestion] Token/Auth error:", err.message);
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ status: false, message: "Invalid or expired token." });
        }
        return res.status(500).json({ status: false, message: "Server error processing request." });
    }
};

module.exports = { answerQuestion };