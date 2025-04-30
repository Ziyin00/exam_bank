const connection = require("../../db");
const jwt = require("jsonwebtoken");



const giveComment = async (req, res) => {
    const { course_id, comment } = req.body;
    const token = req.header("s-token");

    if (!token) {
        return res.status(400).json({ status: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.STUDENT_KEY);
        const student_id = decoded.id;

        if (!course_id || !comment) {
            return res.status(400).json({ status: false, message: "Missing fields" });
        }

        const sql = `INSERT INTO course_comments (course_id, student_id, comment) VALUES (?, ?, ?)`;
        connection.query(sql, [course_id, student_id, comment], (err, result) => {
            if (err) return res.status(500).json({ status: false, message: "DB Error" });
            return res.status(200).json({ status: true, message: "Comment added" });
        });
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ status: false, message: "Invalid or expired token" });
    }
};

module.exports = { giveComment }

