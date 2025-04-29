const bcrypt = require('bcrypt')
const path = require('path')
const multer = require('multer')
const connection = require('../../db')


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

const addTeachers = [upload.single('image'), async (req, res) => {
    const { name, email, password, department_id } = req.body;

    if (!name || !email || !password) {
        return res.status(200).json({ status: false, message: 'Missing required fields!' })
    }


    try {

        const image = req.file ? req.file.filename : null;

        bcrypt.hash(password, 10, (err, hash) => {
            const value = [
                name,
                email,
                hash,
                image,
                department_id
            ]

            if (err) {
                return res.status(500).json({ hash: false, error: 'hash error' })
            }

            const isTeacherFound = 'SELECT id FROM teachers WHERE email = ?'
            connection.query(isTeacherFound, [email], (err, result) => {
                if (err) {
                    console.error(err.message)
                    return res.status(500).json({ status: false, error: 'query error' })
                }
                if (result.length > 0) {
                    return res.status(200).json({ status: false, message: 'Email Already Exist!' })
                }

                const sql = 'INSERT INTO teachers (name , email , password , image , department_id) VALUES (?)'

                connection.query(sql, [value], (err, result) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ status: false, error: 'query error' })
                    }
                    return res.status(200).json({ status: true, message: 'teacher added successfully!' })
                })
            })

        })


    } catch (err) {
        console.log(err.message)
        return res.status(400).json({ status: false, error: 'server error' })
    }
}]


module.exports = { addTeachers }