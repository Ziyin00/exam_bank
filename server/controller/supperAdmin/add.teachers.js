const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const connection = require('../../db');
const nodemailer = require('nodemailer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/image');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'fuad47722@gmail.com', // replace with your Gmail
        pass: 'bgar wimt znpt sbzh' // use app password from Google
    }
});

const addTeachers = [
    upload.single('image'),
    async (req, res) => {
        const { name, email, department_id } = req.body;
        let { password } = req.body;

        if (!name || !email || !department_id) {
            return res.status(200).json({ status: false, message: 'Missing required fields!' });
        }

        function generateDefaultPassword(length = 7) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%!&*';
            let password = '';
            for (let i = 0; i < length; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
        }


        const defaultPassword = generateDefaultPassword()
        if (!password) password = defaultPassword;

        try {
            const image = req.file ? req.file.filename : null;

            bcrypt.hash(password, 10, (err, hash) => {
                const values = [name, email, hash, image, department_id];

                if (err) {
                    return res.status(500).json({ status: false, error: 'Hash error' });
                }

                const checkQuery = 'SELECT id FROM teachers WHERE email = ?';
                connection.query(checkQuery, [email], (err, result) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ status: false, error: 'Query error' });
                    }

                    if (result.length > 0) {
                        return res.status(200).json({ status: false, message: 'Email Already Exists!' });
                    }

                    const insertQuery = 'INSERT INTO teachers (name, email, password, image, department_id) VALUES (?)';
                    connection.query(insertQuery, [values], (err) => {
                        if (err) {
                            console.error(err.message);
                            return res.status(500).json({ status: false, error: 'Insert query error' });
                        }

                        // Send email with password
                        const mailOptions = {
                            from: 'your_email@gmail.com',
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

                        transporter.sendMail(mailOptions, (err, info) => {
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
