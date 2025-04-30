const connection = require('../../db');
const bcrypt = require('bcrypt');
const path = require('path');
const jwt = require('jsonwebtoken')
const multer = require('multer');

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


const updateTeacher = [
    upload.single('image'),
    async (req, res) => {

        const token = req.header('t-token');
        if (!token) {
            return res.status(400).json({ status: false, message: 'Access denied, no token provided!' });
        }

        let teacher_id;
        try {
            const decoded = jwt.verify(token, process.env.TEACHER_PASSWORD); // Use your JWT secret here
            teacher_id = decoded.id;
        } catch (err) {
            return res.status(401).json({ status: false, message: 'Invalid or expired token!' });
        }

        const { name, email, password } = req.body;
        const image = req.file ? req.file.filename : null;

        if (!name || !email) {
            return res.status(400).json({ status: false, message: 'Missing required fields!' });
        }

        try {

            if (password) {
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) {
                        return res.status(500).json({ status: false, message: 'Hash error' });
                    }

                    const sql = `
                        UPDATE teachers
                        SET name = ?, email = ?, password = ?, image = IFNULL(?, image)
                        WHERE id = ?
                    `;

                    connection.query(sql, [name, email, hashedPassword, image, teacher_id], (err) => {
                        if (err) {
                            console.error(err.message);
                            return res.status(500).json({ status: false, message: 'Database update error' });
                        }

                        return res.status(200).json({ status: true, message: 'Teacher updated with password and image' });
                    });
                });
            } else {
                // if no password password
                const sql = `
                    UPDATE teachers
                    SET name = ?, email = ?,  image = IFNULL(?, image)
                    WHERE id = ?
                `;

                connection.query(sql, [name, email, image, teacher_id], (err) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ status: false, message: 'Database update error' });
                    }

                    return res.status(200).json({ status: true, message: 'Teacher updated successfully' });
                });
            }
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ status: false, message: 'Server error' });
        }
    }
];

module.exports = { updateTeacher };
