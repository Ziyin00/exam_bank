const connection = require("../../db");

const getCoursesByDepartment = async (req, res) => {
    const departmentId = req.params.id;

    try {
        const sql = `
        SELECT id, title, description, image, category_id, department_id
        FROM courses
        WHERE department_id = ?
    `;

        connection.query(sql, [departmentId], (err, results) => {
            if (err) {
                console.error("Error fetching courses by department:", err);
                return res.status(500).json({ status: false, message: "Internal server error" });
            }

            return res.status(200).json({ status: true, data: results });
        });
    } catch (err) {
        console.log(err.message)
    }
};

module.exports = { getCoursesByDepartment };
