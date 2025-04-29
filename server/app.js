const express = require('express');
const adminRouter = require('./Route/supperAdminRouter')
const cors = require('cors');
const studeRouter = require('./Route/studentRouter')
const teacehrRouter = require('./Route/teacherRouter')
require('dotenv').config();

const app = express();



app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE'],
    credentials: true,
}));



app.use(express.json());
app.use('/admin', adminRouter);
app.use('/student', studeRouter)
app.use('/teacher', teacehrRouter)

// app.use(express.static('public'));



app.listen(process.env.PORT || 3032, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});