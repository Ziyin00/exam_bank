const connection = require("../../db");



// GET /api/exams
const getAllExams = async (req, res) => {
    const sql = `
        SELECT 
            e.id AS exam_id,
            e.title AS exam_title,
            e.description AS exam_description,
            e.image AS exam_image,
            e.created_at,
            c.id AS category_id,
            c.name AS category_name,
            c.description AS category_description
        FROM exams e
        JOIN categories c ON e.category_id = c.id
        ORDER BY e.created_at DESC
    `;

    try {
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('DB Error:', err.message);
                return res.status(500).json({ status: false, message: 'Database error' });
            }

            return res.status(200).json({ status: true, data: results });
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: 'server error' })
    }
}

module.exports = { getAllExams }
