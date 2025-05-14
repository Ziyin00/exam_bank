const connection = require("../../db");

const getAllCourses = async (req, res) => {
    try {
        const sql = `
            SELECT id, title, description, image, category_id, department_id
            FROM courses
        `;

        connection.query(sql, (err, results) => {
            if (err) {
                console.error("Error fetching all courses:", err);
                return res.status(500).json({ status: false, message: "Internal server error" });
            }

            return res.status(200).json({ status: true, data: results });
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ status: false, message: "Unexpected server error" });
    }
};

module.exports = { getAllCourses };
