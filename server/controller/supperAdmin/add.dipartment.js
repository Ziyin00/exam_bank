const connection = require("../../db");

const addDepartment = async (req, res) => {
    const { department_name } = req.body || {};

    if (!department_name) {
        return res.status(400).json({ status: false, message: 'department_name is required' });
    }

    try {
        const checkQuery = 'SELECT * FROM departments WHERE department_name = ?';

        connection.query(checkQuery, [department_name], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: false, message: 'Database error while checking department' });
            }

            if (results.length > 0) {
                return res.status(400).json({ status: false, message: 'Department already exists' });
            }

            const insertQuery = 'INSERT INTO departments (department_name) VALUES (?)';

            connection.query(insertQuery, [department_name], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(400).json({ status: false, message: 'Insert query error' });
                }

                return res.status(200).json({ status: true, message: 'Department added successfully' });
            });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, message: 'Server error' });
    }
};

module.exports = { addDepartment };
