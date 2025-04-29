const connection = require("../../db");


const getUntiteldSection = async (req, res) => {
    try {
        const sql = `
            SELECT 
                c.id AS course_id,
                c.title,
                c.description,
                c.image,
                cl.link_name,
                cl.link
            FROM courses c
            LEFT JOIN course_links cl ON c.id = cl.course_id
        `;

        connection.query(sql, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: false, message: "Database query error" });
            }

            const courses = {};

            results.forEach(row => {
                const id = row.course_id;

                if (!courses[id]) {
                    courses[id] = {
                        title: row.title,
                        description: row.description,
                        image: row.image,
                        links: []
                    };
                }

                if (row.link && row.link_name) {
                    courses[id].links.push({
                        link_name: row.link_name,
                        link: row.link
                    });
                }
            });

            const formatted = Object.values(courses);

            return res.status(200).json({ status: true, data: formatted });
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, message: "Server error" });
    }
};

module.exports = { getUntiteldSection };
