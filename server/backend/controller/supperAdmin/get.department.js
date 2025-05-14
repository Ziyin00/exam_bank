const connection = require("../../db");


const getDepartment = async (req, res) => {
    const sql = 'SELECT * FROM departments';

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching departments:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.status(200).json(results);
    });
}

module.exports = { getDepartment }