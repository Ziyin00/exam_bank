const connection = require('../../db');

const deleteExam = async (req, res) => {
    const examId = req.params.id;

    if (!examId) {
        return res.status(400).json({ status: false, message: "Exam ID is required" });
    }

    try {
        const sql = `DELETE FROM exams WHERE id = ?`;
        connection.query(sql, [examId], (err, result) => {
            if (err) {
                console.error("Delete error:", err.message);
                return res.status(500).json({ status: false, message: "Database error" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ status: false, message: "Exam not found" });
            }

            return res.status(200).json({ status: true, message: "Exam deleted successfully" });
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ status: false, message: "Server error" });
    }
};

module.exports = { deleteExam };
