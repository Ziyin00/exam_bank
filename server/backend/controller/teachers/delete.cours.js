const connection = require('../../db');

const deleteCourse = (req, res) => {
    const courseId = req.params.id;

    const deleteLinks = `DELETE FROM course_links WHERE id = ?`;
    const deleteCourse = `DELETE FROM courses WHERE id = ?`;

    connection.query(deleteLinks, [courseId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: false, message: 'Error deleting course links' });
        }

        connection.query(deleteCourse, [courseId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: false, message: 'Error deleting course' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ status: false, message: 'Course not found' });
            }

            return res.status(200).json({ status: true, message: 'Course deleted successfully' });
        });
    });
};

module.exports = { deleteCourse };
