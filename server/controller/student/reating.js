const jwt = require('jsonwebtoken');
const connection = require("../../db");


const rateCourse = async (req, res) => {
    const { course_id, rating } = req.body;
    const role = req.header("role");
    const token = req.header(`${role}-token`);

    if (!token || !role) {
        return res.status(400).json({ status: false, message: "No token or role provided" });
    }



    try {
        let secretKey;
        switch (role) {
            case "student":
                secretKey = process.env.STUDENT_KEY;
                break;
            case "teacher":
                secretKey = process.env.TEACHER_KEY;
                break;
            case "admin":
                secretKey = process.env.ADMIN_KEY;
                break;
            default:
                return res.status(400).json({ status: false, message: "Invalid role" });
        }

        // Verify the token
        const decoded = jwt.verify(token, secretKey);
        const user_id = decoded.id;

    } catch (err) {
        return res.status(401).json({ status: false, message: 'Invalid token' });
    }

    if (!course_id || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ status: false, message: 'Invalid input' });
    }

    try {
        const checkQuery = `SELECT * FROM course_ratings WHERE course_id = ? AND student_id = ?`;
        connection.query(checkQuery, [course_id, user_id], (err, results) => {
            if (err) return res.status(500).json({ status: false, message: 'DB error' });

            if (results.length > 0) {
                const updateQuery = `UPDATE course_ratings SET rating = ?, rated_at = NOW() WHERE course_id = ? AND student_id = ?`;
                connection.query(updateQuery, [rating, course_id, student_id], (err) => {
                    if (err) return res.status(500).json({ status: false, message: 'Failed to update rating' });
                    return res.status(200).json({ status: true, message: 'Rating updated' });
                });
            } else {
                const insertQuery = `INSERT INTO course_ratings (course_id, student_id, rating) VALUES (?, ?, ?)`;
                connection.query(insertQuery, [course_id, student_id, rating], (err) => {
                    if (err) return res.status(500).json({ status: false, message: 'Failed to save rating' });
                    return res.status(200).json({ status: true, message: 'Rating saved' });
                });
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: 'Server error' });
    }
};

module.exports = { rateCourse };
