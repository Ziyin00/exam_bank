const bcrypt = require('bcrypt');
const connection = require('../../db');


const addAccount = async (req, res) => {
    const { name, email, password } = req.body;

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
                image
            ]

            if (err) {
                return res.status(500).json({ hash: false, error: 'hash error' })
            }

            const isAdminFound = 'SELECT id FROM super_admin WHERE email = ?'
            connection.query(isAdminFound, [email], (err, result) => {
                if (err) {
                    console.error(err.message)
                    return res.status(500).json({ status: false, error: 'query error' })
                }
                if (result.length > 0) {
                    return res.status(200).json({ status: false, message: 'Email Already Exist!' })
                }

                const sql = 'INSERT INTO super_admin (name , email , password , image) VALUES (?)'

                connection.query(sql, [value], (err, result) => {
                    if (err) {
                        console.error(err.message);
                        return res.status(500).json({ status: false, error: 'query error' })
                    }
                    return res.status(200).json({ status: true, message: 'Admin added successfully!' })
                })
            })

        })


    } catch (err) {
        console.log(err.message)
        return res.status(400).json({ status: false, error: 'server error' })
    }
}

module.exports = { addAccount }