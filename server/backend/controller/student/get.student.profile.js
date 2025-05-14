const connection = require('../../db');
const jwt = require('jsonwebtoken');

const getStudentProfile = async (req, res) => {
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

        const decoded = jwt.verify(token, secretKey);
        const user_id = decoded.id;

        const sql = `
            SELECT id, name, email, department_id
            FROM students
            WHERE id = ?
        `;

        connection.query(sql, [user_id], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ status: false, message: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ status: false, message: 'Student not found' });
            }

            return res.status(200).json({ status: true, data: results[0] });
        });

    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(500).json({ status: false, message: 'Invalid or expired token' });
    }
};

module.exports = { getStudentProfile };
