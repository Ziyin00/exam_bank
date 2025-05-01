


const connection = require('../../db');

const updateStudent = async (req, res) => {
    const student_id = req.params.id;
    const { name, email, department_id } = req.body;

    if (!name || !email || !department_id) {
        return res.status(400).json({ status: false, message: 'Missing required fields!' });
    }

    const sql = `
        UPDATE students
        SET name = ?, email = ?, department_id = ?
        WHERE id = ?
    `;

    connection.query(sql, [name, email, department_id, student_id], (err, result) => {
        if (err) {
            console.error('Update error:', err);
            return res.status(500).json({ status: false, message: 'Database error' });
        }

        return res.status(200).json({ status: true, message: 'student updated successfully' });
    });
};

module.exports = { updateStudent };
