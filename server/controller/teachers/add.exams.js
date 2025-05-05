const connection = require("../../db");



const path = require('path');
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

const postExams = [upload.single('image'), async (req, res) => {

    const { title, description, department_id } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!title || !department_id) {
        return res.status(400).json({ status: false, message: 'Title and category are required' });
    }
    try {
        const sql = 'INSERT INTO exams (title, description, image, department_id) VALUES (?, ?, ?, ?)';
        connection.query(sql, [title, description, image, department_id], (err, result) => {
            if (err) {
                console.error('Insert error:', err.message);
                return res.status(500).json({ status: false, message: 'Database error' });
            }
            return res.status(200).json({ status: true, message: 'Exam added successfully' });
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: 'server error' })
    }
}];



module.exports = { postExams }
