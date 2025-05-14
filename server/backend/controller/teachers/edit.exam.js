const connection = require("../../db");
const path = require("path");
const multer = require("multer");


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


const editExam = [
    upload.single("image"),
    async (req, res) => {
        const examId = req.params.id;
        const { title, description, category_id } = req.body;
        const image = req.file ? req.file.filename : null;

        if (!title || !category_id) {
            return res.status(400).json({ status: false, message: "Title and category are required" });
        }

        try {
            const sql = `
                UPDATE exams
                SET title = ?, description = ?, category_id = ?, image = IFNULL(?, image)
                WHERE id = ?
            `;
            const values = [title, description, category_id, image, examId];

            connection.query(sql, values, (err, result) => {
                if (err) {
                    console.error("Update error:", err.message);
                    return res.status(500).json({ status: false, message: "Database error" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ status: false, message: "Exam not found" });
                }

                return res.status(200).json({ status: true, message: "Exam updated successfully" });
            });
        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ status: false, message: "Server error" });
        }
    }
];

module.exports = { editExam };
