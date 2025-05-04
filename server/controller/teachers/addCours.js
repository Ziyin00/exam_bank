const connection = require('../../db');
const path = require('path')
const multer = require('multer')


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


const addCourse = [upload.single('image'), async (req, res) => {
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

    // Handle image from multer
    const image = req.file ? req.file.filename : null;

    try {
        const checkQuery = 'SELECT * FROM courses WHERE title = ?';
        connection.query(checkQuery, [title], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ status: false, message: 'Database error while checking course' });
            }

            if (results.length > 0) {
                return res.status(400).json({ status: false, message: 'Course already exists' });
            }

            const insertQuery = `
                INSERT INTO courses (title, course_tag, category_id,department_id,benefit1, benefit2, prerequisite1, prerequisite2, image, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                image,
                description,
            ];

            connection.query(insertQuery, values, (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(400).json({ status: false, message: 'Insert query error' });
                }

                const courseId = result.insertId;

                // Insert links
                if (Array.isArray(links) && links.length > 0) {
                    const linkValues = links.map(link => [courseId, link.link_name, link.link]);
                    const linkQuery = `INSERT INTO course_links (course_id, link_name, link) VALUES ?`;

                    connection.query(linkQuery, [linkValues], (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ status: false, message: 'Error saving course links' });
                        }

                        return res.status(200).json({ status: true, message: 'Course and links added successfully' });
                    });
                } else {
                    return res.status(200).json({ status: true, message: 'Course added without links' });
                }
            });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: false, message: 'Server error' });
    }
}];


module.exports = { addCourse };
