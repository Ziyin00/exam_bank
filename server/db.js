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

        `CREATE TABLE IF NOT EXISTS classes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            class_name VARCHAR(50) NOT NULL UNIQUE
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
            class_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (department_id) REFERENCES departments(id),
            FOREIGN KEY (class_id) REFERENCES classes(id)
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
            name VARCHAR(100) NOT NULL,
            code VARCHAR(50) UNIQUE NOT NULL,
            department_id INT,
            teacher_id INT,
            FOREIGN KEY (department_id) REFERENCES departments(id),
            FOREIGN KEY (teacher_id) REFERENCES teachers(id)
        );`,

        `CREATE TABLE IF NOT EXISTS exams (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            title VARCHAR(150) NOT NULL,
            date DATE,
            duration_minutes INT,
            total_marks INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (course_id) REFERENCES courses(id)
                ON DELETE CASCADE ON UPDATE CASCADE
        );`,

        `CREATE TABLE IF NOT EXISTS questions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            exam_id INT NOT NULL,
            text TEXT NOT NULL,
            mark INT,
            FOREIGN KEY (exam_id) REFERENCES exams(id)
                ON DELETE CASCADE ON UPDATE CASCADE
        );`,

        `CREATE TABLE IF NOT EXISTS answers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            question_id INT NOT NULL,
            answer_text TEXT NOT NULL,
            is_correct BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (question_id) REFERENCES questions(id)
                ON DELETE CASCADE ON UPDATE CASCADE
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