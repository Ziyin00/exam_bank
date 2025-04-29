

const connection = require("../../db");


const getStudents = async (req, res) => {
    const sql = `
        SELECT 
            students.id, 
            students.name, 
            students.email, 
            students.image, 
            students.created_at,
            departments.department_name
        FROM students
        LEFT JOIN departments ON students.department_id = departments.id
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.status(200).json(results);
    });
};

module.exports = { getStudents };

