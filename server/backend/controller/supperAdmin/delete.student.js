
const connection = require("../../db");

const deleteStudent = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ status: false, message: 'ID not provided!' });
    }

    try {
        const checkQuery = 'SELECT * FROM students WHERE id = ?';

        connection.query(checkQuery, [id], (err, result) => {
            if (err) {
                return res.status(500).json({ status: false, message: 'Query error!' });
            }

            if (result.length === 0) {
                return res.status(404).json({ status: false, message: 'student not found!' });
            }

            const deleteQuery = 'DELETE FROM students WHERE id = ?';
            connection.query(deleteQuery, [id], (err, deleteResult) => {
                if (err) {
                    return res.status(500).json({ status: false, message: 'Delete query error!' });
                }

                return res.status(200).json({ status: true, message: 'student deleted successfully!' });
            });
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ status: false, message: 'Server error!' });
    }
};

module.exports = { deleteStudent };
