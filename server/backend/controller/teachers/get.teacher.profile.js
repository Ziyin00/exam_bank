const connection = require('../../db');
const jwt = require('jsonwebtoken');

// Get Teacher Profile
const getTeacherProfile = async (req, res) => {
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

        const sql = `SELECT id, name, email, image FROM teachers WHERE id = ?`;
        connection.query(sql, [user_id], (err, result) => {
            if (err) {
                console.error("Database query error:", err.message);
                return res.status(500).json({ status: false, message: "Database error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ status: false, message: "Teacher not found" });
            }

            return res.status(200).json({ status: true, teacher: result[0] });
        });
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(401).json({ status: false, message: "Invalid or expired token" });
    }
};

module.exports = { getTeacherProfile };
