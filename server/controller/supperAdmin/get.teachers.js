const connection = require("../../db");

const getTeachers = async (req, res) => {
    const sql = 'SELECT id, name, email, image, department_id, created_at FROM teachers';

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching teachers:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.status(200).json(results);
    });
};

module.exports = { getTeachers };
