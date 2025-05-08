// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connection = require("../../db");

const userLogin = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ loginStatus: false, message: "Email, password, and role are required" });
    }

    const roleTableMap = {
        student: "students",
        teacher: "teachers",
        admin: "super_admin",
    };

    const tableName = roleTableMap[role];

    if (!tableName) {
        return res.status(400).json({ loginStatus: false, message: "Invalid role" });
    }

    try {
        const sql = `SELECT * FROM ${tableName} WHERE email = ?`;
        connection.query(sql, [email], async (err, result) => {
            if (err) {
                console.error("Database query error:", err.message);
                return res.status(500).json({ loginStatus: false, message: "Database query error" });
            }

            if (result.length === 0) {
                return res.status(200).json({ loginStatus: false, message: "Wrong Email or Password" });
            }

            const userId = result[0].id;
            const hashedPassword = result[0].password;

            const isPasswordValid = await bcrypt.compare(password, hashedPassword);

            if (!isPasswordValid) {
                return res.status(200).json({ loginStatus: false, message: "Wrong Email or Password" });
            }

            const tokenKey = process.env[`${role.toUpperCase()}_KEY`];

            if (!tokenKey) {
                return res.status(500).json({ loginStatus: false, message: "Server error: Missing token key" });
            }

            const token = jwt.sign(
                { role, email, id: userId },
                tokenKey,
                { expiresIn: "30d" }
            );

            res.status(200).json({ loginStatus: true, token });
        });
    } catch (err) {
        console.error("Server error:", err.message);
        res.status(500).json({ loginStatus: false, message: "Server error" });
    }
};

module.exports = { userLogin };
