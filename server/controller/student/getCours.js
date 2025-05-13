const connection = require("../../db");

const getCoursesById = async (req, res) => {
    const  Id = req.params.id;

    try {
        const sql = `
        SELECT id, title, description, image, category_id, department_id
        FROM courses
        WHERE Id = ?
    `;

        connection.query(sql, [Id], (err, results) => {
            if (err) {
                console.error("Error fetching courses by Id:", err);
                return res.status(500).json({ status: false, message: "Internal server error" });
            }

            return res.status(200).json({ status: true, data: results });
        });
    } catch (err) {
        console.log(err.message)
    }
};

module.exports = { getCoursesById };
