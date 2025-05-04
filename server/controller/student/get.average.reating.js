const connection = require("../../db");

const getCourseRating = (req, res) => {
    const courseId = req.params.course_id;

    try {
        const query = `
        SELECT 
            AVG(rating) AS average_rating,
            COUNT(*) AS total_ratings 
        FROM course_ratings 
        WHERE course_id = ?
    `;

        connection.query(query, [courseId], (err, results) => {
            if (err) return res.status(500).json({ status: false, message: 'Error fetching rating' });

            res.status(200).json({
                status: true,
                average_rating: parseFloat(results[0].average_rating || 0).toFixed(1),
                total_ratings: results[0].total_ratings
            });
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: 'server error' })
    }
};

module.exports = { getCourseRating }
