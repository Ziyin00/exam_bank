const jwt = require('jsonwebtoken');
const connection = require('../../db');

const getAccount = (req, res) => {
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


        const sql = 'SELECT id, name, email, image FROM super_admin WHERE id = ?';

        connection.query(sql, [user_id], (err, result) => {
            if (err) {
                console.error('Query error:', err.message);
                return res.status(500).json({ status: false, message: "Database error" });
            }

            if (result.length === 0) {
                return res.status(404).json({ status: false, message: "Admin not found" });
            }

            return res.status(200).json({ status: true, data: result[0] });
        });

    } catch (err) {
        console.error("Token error:", err.message);
        return res.status(401).json({ status: false, message: "Invalid or expired token" });
    }
};

module.exports = { getAccount };
