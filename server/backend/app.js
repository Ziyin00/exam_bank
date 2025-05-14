const express = require('express');
const adminRouter = require('./Route/supperAdminRouter')
const cors = require('cors');
const studeRouter = require('./Route/studentRouter')
const teacehrRouter = require('./Route/teacherRouter')
require('dotenv').config();

const app = express();


app.use(express.json());
// CORS Configuration
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE'],
    credentials: true,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.use('/admin', adminRouter);
app.use('/student', studeRouter);
app.use('/teacher', teacehrRouter);

// Add this direct route for student sign-up
app.post('/student-sign-up', (req, res) => {
    // Handle the sign-up logic here or import from your controller
    res.status(200).json({ status: true, message: 'Signup endpoint works!' });
});

app.listen(process.env.PORT || 3032, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});