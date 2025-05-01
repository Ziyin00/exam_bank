const bcrypt = require('bcrypt');
const connection = require('../../db');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/image')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage
})


const editAccount = [
    upload.single('image'),
    async (req, res) => {

        const token = req.header('a-token');
        if (!token) {
            return res.status(400).json({ status: false, message: 'Access denied, no token provided!' });
        }

        let adminId;
        try {
            const decoded = jwt.verify(token, process.env.ADMIN_PASSWORD);
            adminId = decoded.id;
        } catch (err) {
            return res.status(401).json({ status: false, message: 'Invalid or expired token!' });
        }

        const { name, email, password } = req.body;
        const image = req.file ? req.file.filename : null;

        if (!name || !email) {
            return res.status(400).json({ status: false, message: 'Missing required fields!' });
        }

        try {
            const checkEmailQuery = 'SELECT id FROM super_admin WHERE email = ? AND id != ?';
            connection.query(checkEmailQuery, [email, adminId], (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ status: false, message: 'Email check query error' });
                }

                if (results.length > 0) {
                    return res.status(200).json({ status: false, message: 'Email already in use by another account' });
                }

                // If password (kale)
                if (password) {
                    bcrypt.hash(password, 10, (err, hashedPassword) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ status: false, message: 'Password hash error' });
                        }

                        const updateQuery = `
                            UPDATE super_admin
                            SET name = ?, email = ?, password = ?, image = IFNULL(?, image)
                            WHERE id = ?
                        `;

                        connection.query(updateQuery, [name, email, hashedPassword, image, adminId], (err) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ status: false, message: 'Update query error' });
                            }

                            return res.status(200).json({ status: true, message: 'Account updated successfully (with password)' });
                        });
                    });
                } else {
                    // No password (kelele)
                    const updateQuery = `
                        UPDATE super_admin
                        SET name = ?, email = ?, image = IFNULL(?, image)
                        WHERE id = ?
                    `;

                    connection.query(updateQuery, [name, email, image, adminId], (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ status: false, message: 'Update query error' });
                        }

                        return res.status(200).json({ status: true, message: 'Account updated successfully (no password)' });
                    });
                }
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ status: false, message: 'Server error' });
        }
    }
];

module.exports = { editAccount };
