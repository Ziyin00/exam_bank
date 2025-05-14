const connection = require("../../db");

const getAllCourses = async (req, res) => {
    try {
        const sql = `
            SELECT 
                courses.id, 
                courses.title, 
                courses.description,
                courses.image,
                courses.category_id,
                courses.department_id,
                departments.department_name,
                courses.year
            FROM courses
            JOIN departments ON courses.department_id = departments.id
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
