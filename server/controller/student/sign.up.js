const bcrypt = require('bcrypt');
const connection = require('../../db');


const path = require('path')
const multer = require('multer')


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




const studentSignUp = [upload.single('image'), async (req, res) => {
    const { name, email, password, department_id } = req.body;

    if (!name || !email || !password || !department_id) {
        return res.status(400).json({ status: false, message: 'Missing required fields!' });
    }

    try {
        const image = req.file ? req.file.filename : null;

        bcrypt.hash(password, 10, (err, hash) => {
            const value = [
                name,
                email,
                hash,
                image,
                department_id
            ];

            if (err) {
                return res.status(500).json({ status: false, error: 'Hash error' });
            }

            const isAdminFound = 'SELECT id FROM students WHERE email = ?';
            connection.query(isAdminFound, [email], (err, result) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).json({ status: false, error: 'Query error' });
                }
                if (result.length > 0) {
                    return res.status(400).json({ status: false, message: 'Email Already Exists!' });
                }

                const sql = 'INSERT INTO students (name, email, password, image, department_id) VALUES (?)';
                connection.query(sql, [value], (err, result) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ status: false, error: 'Query error' });
                    }

                    return res.status(200).json({ status: true, message: 'Student added successfully!' });
                });
            });
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, error: 'Server error' });
    }
}]

module.exports = { studentSignUp };

