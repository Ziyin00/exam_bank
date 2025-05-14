// controller/student/sign.up.js
const bcrypt = require('bcrypt');
const connection = require('../../db');

const studentSignUp = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ status: false, message: 'All fields are required!' });
    }

    try {
        // Check if email exists
        connection.query(
            'SELECT id FROM students WHERE email = ?', 
            [email],
            async (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ status: false, error: 'Database error' });
                }
                
                if (results.length > 0) {
                    return res.status(409).json({ status: false, message: 'Email already exists!' });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);
                
                // Create user
                connection.query(
                    'INSERT INTO students (name, email, password) VALUES (?, ?, ?)',
                    [name, email, hashedPassword],
                    (err, result) => {
                        if (err) {
                            console.error('Insert error:', err);
                            return res.status(500).json({ status: false, error: 'Registration failed' });
                        }
                        res.status(201).json({ 
                            status: true, 
                            message: 'Registration successful!',
                            userId: result.insertId
                        });
                    }
                );
            }
        );
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ status: false, error: 'Internal server error' });
    }
}

module.exports = { studentSignUp };