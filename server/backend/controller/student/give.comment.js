const connection = require("../../db");
const jwt = require("jsonwebtoken");



const giveComment = async (req, res) => {
    const { course_id, comment } = req.body;
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
        const user_id = decoded.id;;

        if (!course_id || !comment) {
            return res.status(400).json({ status: false, message: "Missing fields" });
        }

        const sql = `INSERT INTO course_comments (course_id, student_id, comment) VALUES (?, ?, ?)`;
        connection.query(sql, [course_id, user_id, comment], (err, result) => {
            if (err) return res.status(500).json({ status: false, message: "DB Error" });
            return res.status(200).json({ status: true, message: "Comment added" });
        });
    } catch (err) {
        console.error(err.message);
        return res.status(400).json({ status: false, message: "Invalid or expired token" });
    }
};

module.exports = { giveComment }

