const jwt = require('jsonwebtoken');
const connection = require('../../db');

const getAccount = (req, res) => {
    const token = req.header('a-token');

    if (!token) {
        return res.status(401).json({ status: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_PASSWORD);
        const admin_id = decoded.id;

        const sql = 'SELECT id, name, email, image FROM super_admin WHERE id = ?';

        connection.query(sql, [admin_id], (err, result) => {
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
