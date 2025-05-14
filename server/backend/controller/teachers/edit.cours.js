

const connection = require('../../db');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/image')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({
    storage: storage
})

const editCourse = [
    upload.single('image'),
    async (req, res) => {
        const course_id = req.params.id;
        const {
            title,
            course_tag,
            category_id,
            department_id,
            benefit1,
            benefit2,
            prerequisite1,
            prerequisite2,
            description,
            links
        } = req.body;

        const image = req.file ? req.file.filename : null;

        if (!title || !course_tag || !category_id || !description) {
            return res.status(400).json({ status: false, message: 'Missing required fields!' });
        }

        try {
            const updateQuery = `
                UPDATE courses
                SET title = ?, course_tag = ?, category_id = ?,department_id = ? , benefit1 = ?, benefit2 = ?, prerequisite1 = ?, prerequisite2 = ?, description = ?, image = IFNULL(?, image)
                WHERE id = ?
            `;
            const values = [
                title,
                course_tag,
                category_id,
                department_id,
                benefit1,
                benefit2,
                prerequisite1,
                prerequisite2,
                description,
                image,
                course_id
            ];

            connection.query(updateQuery, values, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ status: false, message: 'Database update error' });
                }

                // Remove old links if new ones are provided
                if (Array.isArray(links) && links.length > 0) {
                    const deleteLinksQuery = `DELETE FROM course_links WHERE course_id = ?`;
                    connection.query(deleteLinksQuery, [course_id], (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ status: false, message: 'Failed to delete old links' });
                        }

                        const newLinks = links.map(link => [course_id, link.link_name, link.link]);
                        const insertLinksQuery = `INSERT INTO course_links (course_id, link_name, link) VALUES ?`;

                        connection.query(insertLinksQuery, [newLinks], (err) => {
                            if (err) {
                                console.error(err);
                                return res.status(500).json({ status: false, message: 'Failed to insert new links' });
                            }

                            return res.status(200).json({ status: true, message: 'Course and links updated successfully' });
                        });
                    });
                } else {
                    return res.status(200).json({ status: true, message: 'Course updated without new links' });
                }
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ status: false, message: 'Server error' });
        }
    }
];

module.exports = { editCourse };
