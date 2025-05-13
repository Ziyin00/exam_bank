const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const connection = require('../../db');
const nodemailer = require('nodemailer');

// Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/image');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Nodemailer config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fuad47722@gmail.com',
        pass: 'bgar wimt znpt sbzh' // Gmail App Password
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Main controller
const addTeachers = [
    upload.single('image'),
    async (req, res) => {
        const { name, email, department_id } = req.body;
        let { password } = req.body;

        if (!name || !email) {
            return res.status(200).json({ status: false, message: 'Missing required fields!' });
        }

        // Optional department_id
        const deptId = department_id || null;

        // Generate default password
        function generateDefaultPassword(length = 7) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%!&*';
            let pwd = '';
            for (let i = 0; i < length; i++) {
                pwd += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return pwd;
        }

        const defaultPassword = generateDefaultPassword();
        if (!password) password = defaultPassword;

        try {
            const image = req.file ? req.file.filename : null;

            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({ status: false, error: 'Hashing failed' });
                }

                const values = [name, email, hash, image, deptId];

                const checkQuery = 'SELECT id FROM teachers WHERE email = ?';
                connection.query(checkQuery, [email], (err, result) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ status: false, error: 'Query error' });
                    }

                    if (result.length > 0) {
                        return res.status(200).json({ status: false, message: 'Email already exists!' });
                    }

                    const insertQuery = 'INSERT INTO teachers (name, email, password, image, department_id) VALUES (?)';
                    connection.query(insertQuery, [values], (err) => {
                        if (err) {
                            console.error(err.message);
                            return res.status(500).json({ status: false, error: 'Insert error' });
                        }

                        const mailOptions = {
                            from: 'fuad47722@gmail.com',
                            to: email,
                            subject: 'Your Teacher Account Password',
                            html: `
                                <p>Hello <b>${name}</b>,</p>
                                <p>Your teacher account has been created.</p>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Password:</strong> ${password}</p>
                                <br>
                                <p>Regards,<br>Admin Team</p>
                            `
                        };

                        transporter.sendMail(mailOptions, (err) => {
                            if (err) {
                                console.error('Email send error:', err.message);
                                return res.status(200).json({ status: true, message: 'Teacher added, but failed to send email' });
                            } else {
                                return res.status(200).json({ status: true, message: 'Teacher added and email sent successfully' });
                            }
                        });
                    });
                });
            });
        } catch (err) {
            console.log(err.message);
            return res.status(400).json({ status: false, error: 'Server error' });
        }
    }
];

module.exports = { addTeachers };
