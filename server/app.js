const express = require('express');
const adminRouter = require('./Route/adminRouter')
const cors = require('cors');
require('dotenv').config();

const app = express();



app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE'],
    credentials: true,
}));



app.use(express.json());
app.use('/admin', adminRouter);

// app.use(express.static('public'));



app.listen(process.env.PORT || 3032, () => {
    console.log(`Server is running on port ${process.env.PORT || 3032}`);
});