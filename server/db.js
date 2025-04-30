const connection = require('./dbConnection/connection');

connection.getConnection((err) => {
    if (err) {
        console.error('Connection failed:', err);
        return;
    }
    console.log('Connected to MySQL');

    const examBank = [

        `CREATE TABLE IF NOT EXISTS super_admin (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            image VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,

        `CREATE TABLE IF NOT EXISTS departments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            department_name VARCHAR(100) NOT NULL UNIQUE
        );`,

        `CREATE TABLE IF NOT EXISTS teachers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            image VARCHAR(255),
            department_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (department_id) REFERENCES departments(id)
        );`,

        `CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            image VARCHAR(255),
            department_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (department_id) REFERENCES departments(id)
        );`,

        `CREATE TABLE IF NOT EXISTS categories (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT
        );`,

        `CREATE TABLE IF NOT EXISTS subjects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            category_id INT,
            FOREIGN KEY (category_id) REFERENCES categories(id)
                ON DELETE SET NULL ON UPDATE CASCADE
        );`,

        `CREATE TABLE IF NOT EXISTS courses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            course_tag VARCHAR(50),
            category_id INT,
            benefit1 TEXT,
            benefit2 TEXT,
            prerequisite1 TEXT,
            prerequisite2 TEXT,
            image VARCHAR(255),
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(id)
                ON DELETE SET NULL ON UPDATE CASCADE
        );`,

        `CREATE TABLE IF NOT EXISTS course_links (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            link_name VARCHAR(100),
            link VARCHAR(255),
            FOREIGN KEY (course_id) REFERENCES courses(id)
                ON DELETE CASCADE ON UPDATE CASCADE
        );`,

        `CREATE TABLE IF NOT EXISTS course_comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            student_id INT NOT NULL,
            comment TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses(id)
                ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (student_id) REFERENCES students(id)
                ON DELETE CASCADE ON UPDATE CASCADE
        );`,

        `CREATE TABLE IF NOT EXISTS course_questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            student_id INT NOT NULL,
            question TEXT NOT NULL,
            reply TEXT,
            teacher_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            replied_at TIMESTAMP NULL DEFAULT NULL,
            FOREIGN KEY (course_id) REFERENCES courses(id)
                ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (student_id) REFERENCES students(id)
                ON DELETE CASCADE ON UPDATE CASCADE,
            FOREIGN KEY (teacher_id) REFERENCES teachers(id)
                ON DELETE SET NULL ON UPDATE CASCADE
        );`
    ];




    const executeQueries = (queries) => {
        queries.forEach((query, index) => {
            connection.query(query, (err) => {
                if (err) {
                    console.error(`Error executing query ${index + 1}:`, err.message);
                } else {
                    // console.log(`Table created/verified for query ${index + 1}`);
                }
            });
        });
    };

    executeQueries(examBank);
});

module.exports = connection;