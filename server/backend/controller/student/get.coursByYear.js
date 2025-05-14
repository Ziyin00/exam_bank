const connection = require("../../db");


const getCoursesByYear = (req, res) => {
    const { year } = req.params;

    try {
        const query = 'SELECT * FROM courses WHERE year = ?';
        connection.query(query, [year], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: false, message: 'Database error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ status: false, message: 'No courses found for the given year' });
            }

            return res.status(200).json({ status: true, courses: results });
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: 'server error' })
    }
};

module.exports = { getCoursesByYear };
