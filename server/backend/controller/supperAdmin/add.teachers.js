const bcrypt = require('bcrypt');
const path = require('path'); // Corrected: path is a module
const multer = require('multer');
const nodemailer = require('nodemailer');
const util = require('util');
const connection = require('../../db'); // Your database connection

// Promisify connection.query if it's not already promise-based
// If your db.js connection.query already returns a Promise, you can skip this.
const queryAsync = util.promisify(connection.query).bind(connection);

// --- Multer Configuration for Image Upload ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure this directory exists and is writable by your Node.js process
        cb(null, 'public/image');
    },
    filename: (req, file, cb) => {
        cb(null, `teacher_img_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error(`File upload only supports the following filetypes: ${allowedTypes}`), false);
    }
});
// Middleware to be applied to the route or called manually
const uploadSingleImage = upload.single('image'); // 'image' is the field name in form-data

// --- Nodemailer Configuration ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL_ADDRESS || 'fuad47722@gmail.com', // USE ENV VARIABLE
        pass: process.env.GMAIL_APP_PASSWORD || 'bgar wimt znpt sbzh'    // USE ENV VARIABLE (App Password)
    },
    tls: {
        rejectUnauthorized: false // For development; be cautious in production
    }
});

// --- Helper Function to Generate a More Secure Default Password ---
function generateDefaultPassword(length = 10) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';

    // Ensure at least one of each character type for better security
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    // Shuffle the generated password to make character positions random
    return password.split('').sort(() => 0.5 - Math.random()).join('');
}

// --- Main addTeachers Controller Function ---
const addTeachersController = async (req, res) => {
    const { name, email, department_id } = req.body;
    let { password: providedPassword } = req.body; // Password might be optionally provided

    // --- 1. Input Validation ---
    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ status: false, message: 'Teacher name is required and must be a non-empty string.' });
    }
    if (!email || typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({ status: false, message: 'Teacher email is required and must be a non-empty string.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ status: false, message: 'Invalid email format.' });
    }

    const deptId = department_id ? parseInt(department_id, 10) : null;
    if (department_id && (isNaN(deptId) || deptId <= 0)) {
        return res.status(400).json({ status: false, message: 'Invalid Department ID. Must be a positive integer.' });
    }

    const actualPassword = providedPassword || generateDefaultPassword();
    const imageName = req.file ? req.file.filename : null;

    try {
        // --- 2. Check if Department Exists (if provided) ---
        if (deptId) {
            const deptCheckSql = 'SELECT id FROM departments WHERE id = ?';
            const [departmentExists] = await queryAsync(deptCheckSql, [deptId]);
            if (!departmentExists) {
                return res.status(400).json({ status: false, message: `Department with ID ${deptId} not found.` });
            }
        }

        // --- 3. Check if Email Already Exists ---
        const emailCheckSql = 'SELECT id FROM teachers WHERE email = ?';
        const existingTeachers = await queryAsync(emailCheckSql, [email.trim()]);
        if (existingTeachers.length > 0) {
            return res.status(409).json({ status: false, message: 'This email address is already registered for a teacher.' });
        }

        // --- 4. Hash Password ---
        const saltRounds = 12; // Increased salt rounds for better security
        const hashedPassword = await bcrypt.hash(actualPassword, saltRounds);

        // --- 5. Insert Teacher into Database ---
        const insertSql = 'INSERT INTO teachers (name, email, password, image, department_id) VALUES (?, ?, ?, ?, ?)';
        const insertValues = [name.trim(), email.trim(), hashedPassword, imageName, deptId];
        const result = await queryAsync(insertSql, insertValues);

        if (!result.insertId) {
            console.error('[ADD TEACHER DB ERROR] Failed to insert teacher, no insertId returned. Result:', result);
            return res.status(500).json({ status: false, message: 'Database error: Failed to add teacher record.' });
        }
        const newTeacherId = result.insertId;
        console.log(`[ADD TEACHER SUCCESS] Teacher '${name.trim()}' (ID: ${newTeacherId}) added to database.`);

        // --- 6. Send Credentials Email ---
        const mailOptions = {
            from: `"Your Platform Name" <${process.env.GMAIL_EMAIL_ADDRESS || 'fuad47722@gmail.com'}>`,
            to: email.trim(),
            subject: 'Welcome! Your Teacher Account Credentials',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; padding: 25px;">
                    <h2 style="color: #0056b3; text-align: center;">Welcome, ${name.trim()}!</h2>
                    <p>We are thrilled to have you join our platform as a teacher. Your account has been successfully created.</p>
                    <p>Here are your login credentials:</p>
                    <ul style="list-style-type: none; padding: 0;">
                        <li style="margin-bottom: 10px;"><strong>Email:</strong> ${email.trim()}</li>
                        <li style="margin-bottom: 10px;"><strong>Password:</strong> <code style="background-color: #f0f0f0; padding: 3px 6px; border-radius: 4px;">${actualPassword}</code></li>
                    </ul>
                    <p>For security reasons, we recommend that you change your password after your first login if the platform supports this feature.</p>
                    <p>You can access the platform at: [Your Platform Login URL - Replace This]</p>
                    <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="text-align: center; font-size: 0.9em; color: #777;">Best Regards,<br>The Admin Team</p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`[EMAIL SUCCESS] Credentials email sent successfully to ${email.trim()} for teacher ID ${newTeacherId}.`);
            return res.status(201).json({ // 201 Created
                status: true,
                message: 'Teacher added successfully and credentials email sent.',
                teacherId: newTeacherId,
                teacher: { id: newTeacherId, name: name.trim(), email: email.trim(), image: imageName, department_id: deptId }
            });
        } catch (emailError) {
            console.error(`[EMAIL ERROR] Failed to send credentials email to ${email.trim()} for teacher ID ${newTeacherId}. Error: ${emailError.message}`, emailError);
            // The teacher was added, but email failed. This is a critical state to report.
            return res.status(207).json({ // 207 Multi-Status: Action was successful but there are follow-up issues.
                status: true, // Indicates the primary action (DB insert) was successful
                message: 'Teacher added to database, but failed to send credentials email. Please notify the teacher manually or retry sending the email.',
                teacherId: newTeacherId,
                teacher: { id: newTeacherId, name: name.trim(), email: email.trim(), image: imageName, department_id: deptId },
                emailError: `Failed to send email: ${emailError.message}`
            });
        }

    } catch (error) {
        console.error('[ADD TEACHER UNHANDLED ERROR]', error);
        // Specific database errors
        if (error.code === 'ER_NO_REFERENCED_ROW_2' && error.sqlMessage.includes('department_id')) {
             return res.status(400).json({ status: false, message: `Invalid Department ID: The specified department does not exist.` });
        }
        return res.status(500).json({ status: false, message: 'An internal server error occurred while adding the teacher.' });
    }
};


// We need to combine multer middleware with the main controller logic.
// The `addTeachers` export will be an array of middleware.
const addTeachers = [
    (req, res, next) => { // Handle multer upload and errors explicitly
        uploadSingleImage(req, res, (err) => {
            if (err) {
                if (err instanceof multer.MulterError) {
                    // A Multer error occurred (e.g., file too large)
                    let message = `File upload error: ${err.message}.`;
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        message = `Image file is too large. Maximum size allowed is ${MAX_FILE_SIZE_MB}MB.`;
                    }
                    return res.status(400).json({ status: false, message });
                }
                // An unknown error occurred when uploading.
                return res.status(400).json({ status: false, message: err.message || 'Error during file upload.' });
            }
            // If no error, or no file uploaded, req.file will be set (or undefined)
            next();
        });
    },
    addTeachersController // The main async controller logic
];

module.exports = { addTeachers };








// const bcrypt = require('bcrypt');
// const path = require('path');
// const multer = require('multer');
// const connection = require('../../db');
// const nodemailer = require('nodemailer');

// // Multer config
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/image');
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
//     }
// });
// const upload = multer({ storage });

// // Nodemailer config
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'fuad47722@gmail.com',
//         pass: 'bgar wimt znpt sbzh' // Gmail App Password
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// });

// // Main controller
// const addTeachers = [
//     upload.single('image'),
//     async (req, res) => {
//         const { name, email, department_id } = req.body;
//         let { password } = req.body;

//         if (!name || !email) {
//             return res.status(200).json({ status: false, message: 'Missing required fields!' });
//         }

//         // Optional department_id
//         const deptId = department_id || null;

//         // Generate default password
//         function generateDefaultPassword(length = 7) {
//             const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%!&*';
//             let pwd = '';
//             for (let i = 0; i < length; i++) {
//                 pwd += chars.charAt(Math.floor(Math.random() * chars.length));
//             }
//             return pwd;
//         }

//         const defaultPassword = generateDefaultPassword();
//         if (!password) password = defaultPassword;

//         try {
//             const image = req.file ? req.file.filename : null;

//             bcrypt.hash(password, 10, (err, hash) => {
//                 if (err) {
//                     return res.status(500).json({ status: false, error: 'Hashing failed' });
//                 }

//                 const values = [name, email, hash, image, deptId];

//                 const checkQuery = 'SELECT id FROM teachers WHERE email = ?';
//                 connection.query(checkQuery, [email], (err, result) => {
//                     if (err) {
//                         console.error(err.message);
//                         return res.status(500).json({ status: false, error: 'Query error' });
//                     }

//                     if (result.length > 0) {
//                         return res.status(200).json({ status: false, message: 'Email already exists!' });
//                     }

//                     const insertQuery = 'INSERT INTO teachers (name, email, password, image, department_id) VALUES (?)';
//                     connection.query(insertQuery, [values], (err) => {
//                         if (err) {
//                             console.error(err.message);
//                             return res.status(500).json({ status: false, error: 'Insert error' });
//                         }

//                         const mailOptions = {
//                             from: 'fuad47722@gmail.com',
//                             to: email,
//                             subject: 'Your Teacher Account Password',
//                             html: `
//                                 <p>Hello <b>${name}</b>,</p>
//                                 <p>Your teacher account has been created.</p>
//                                 <p><strong>Email:</strong> ${email}</p>
//                                 <p><strong>Password:</strong> ${password}</p>
//                                 <br>
//                                 <p>Regards,<br>Admin Team</p>
//                             `
//                         };

//                         transporter.sendMail(mailOptions, (err) => {
//                             if (err) {
//                                 console.error('Email send error:', err.message);
//                                 return res.status(200).json({ status: true, message: 'Teacher added, but failed to send email' });
//                             } else {
//                                 return res.status(200).json({ status: true, message: 'Teacher added and email sent successfully' });
//                             }
//                         });
//                     });
//                 });
//             });
//         } catch (err) {
//             console.log(err.message);
//             return res.status(400).json({ status: false, error: 'Server error' });
//         }
//     }
// ];

// module.exports = { addTeachers };
