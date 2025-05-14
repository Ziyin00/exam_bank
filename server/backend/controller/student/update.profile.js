const connection = require('../../db');
const bcrypt = require('bcrypt');
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


const studentUpdate = [
    upload.single('image'),
    async (req, res) => {

        const role = req.header("role");
        const token = req.header(`${role}-token`);

        if (!token || !role) {
            return res.status(400).json({ status: false, message: "No token or role provided" });
        }


        const { name, email, password } = req.body;
        const image = req.file ? req.file.filename : null;

        if (!name || !email) {
            return res.status(400).json({ status: false, message: 'Missing required fields!' });
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

            if (password) {
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) {
                        return res.status(500).json({ status: false, message: 'Hash error' });
                    }

                    const sql = `
                        UPDATE students
                        SET name = ?, email = ?, password = ?, image = IFNULL(?, image)
                        WHERE id = ?
                    `;

                    connection.query(sql, [name, email, hashedPassword, image, user_id], (err) => {
                        if (err) {
                            console.error(err.message);
                            return res.status(500).json({ status: false, message: 'Database update error' });
                        }

                        return res.status(200).json({ status: true, message: 'student updated with password and image' });
                    });
                });
            } else {
                // if no password password
                const sql = `
                    UPDATE students
                    SET name = ?, email = ?,  image = IFNULL(?, image)
                    WHERE id = ?
                `;

                connection.query(sql, [name, email, image, user_id], (err) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ status: false, message: 'Database update error' });
                    }

                    return res.status(200).json({ status: true, message: 'student updated successfully' });
                });
            }
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ status: false, message: 'Server error' });
        }
    }
];

module.exports = { studentUpdate };
