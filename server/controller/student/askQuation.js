const connection = require("../../db");


const askQuestion = async (req, res) => {
    const { course_id, student_id, question } = req.body;

    try {
        const sql = `INSERT INTO course_questions (course_id, student_id, question) VALUES (?, ?, ?)`;
        connection.query(sql, [course_id, student_id, question], (err, result) => {
            if (err) return res.status(500).json({ status: false, message: "DB error" });
            return res.status(200).json({ status: true, message: "Question submitted" });
        });
    } catch (err) {
        console.log(err.message)
        return res.status(400).json({ status: false, error: 'server error' })
    }
};


module.exports = { askQuestion }
