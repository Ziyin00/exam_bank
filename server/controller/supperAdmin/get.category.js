const connection = require("../../db");




const getCategory = async (req, res) => {
    const sql = 'SELECT * FROM categories';

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        res.status(200).json(results);
    });
};

module.exports = { getCategory };
