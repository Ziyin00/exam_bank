const mysql = require('mysql');
require('dotenv').config()


const connection = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0,
});

console.log(
    {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
        database: process.env.DATABASE,

}
);

module.exports = connection;