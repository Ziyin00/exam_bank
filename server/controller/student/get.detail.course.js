const connection = require("../../db");


const getDetailCours = async (req, res) => {
    const { id } = req.params;


    if (!id) {
        return res.status(400).json({ status: false, message: "Course ID is required" });
    }

    try {

        const getCategoryQuery = 'SELECT category_id FROM courses WHERE category_id = ?';
        connection.query(getCategoryQuery, [id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: false, message: "Error fetching course" });
            }

            if (result.length === 0) {
                return res.status(404).json({ status: false, message: "Course not found" });
            }


            console.log(categoryId)

            const getCoursesQuery = `
                SELECT id, title, description, image, category_id
                FROM courses
                WHERE category_id = ?
            `;
            connection.query(getCoursesQuery, [categoryId], (err, courses) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ status: false, message: "Error fetching related courses" });
                }

                return res.status(200).json({ status: true, data: courses });
            });
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, message: "Server error" });
    }
};

module.exports = { getDetailCours };