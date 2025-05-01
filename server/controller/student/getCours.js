const connection = require("../../db");


const getCoursesOnePerCategory = async (req, res) => {
    const sql = `
        SELECT c1.id, c1.image, c1.title, c1.description, c1.category_id
        FROM courses c1
        INNER JOIN (
            SELECT MIN(id) as id
            FROM courses
            GROUP BY category_id
        ) c2 ON c1.id = c2.id;
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching courses:", err);
            return res.status(500).json({ status: false, message: "Internal server error" });
        }

        return res.status(200).json({ status: true, data: results });
    });
};

module.exports = { getCoursesOnePerCategory };
