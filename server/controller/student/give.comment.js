const connection = require("../../db");


const giveComment = async (req, res) => {
    const { course_id, student_id, comment } = req.body;

    if (!course_id || !student_id || !comment) {
        return res.status(400).json({ status: false, message: "Missing fields" });
    }

    const sql = `INSERT INTO course_comments (course_id, student_id, comment) VALUES (?, ?, ?)`;
    connection.query(sql, [course_id, student_id, comment], (err, result) => {
        if (err) return res.status(500).json({ status: false, message: "DB Error" });
        return res.status(200).json({ status: true, message: "Comment added" });
    });
}


module.exports = { giveComment }