const connection = require("../../db");



const answerQuestion = (req, res) => {
    const { question_id, teacher_id, answer } = req.body;

    try {
        const sql = `INSERT INTO course_answers (question_id, teacher_id, answer) VALUES (?, ?, ?)`;
        connection.query(sql, [question_id, teacher_id, answer], (err, result) => {
            if (err) return res.status(500).json({ status: false, message: "DB error" });
            return res.status(200).json({ status: true, message: "Answer submitted" });
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: 'server error' })
    }
};

module.exports = { answerQuestion }
