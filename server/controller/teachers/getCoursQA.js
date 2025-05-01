const connection = require("../../db");


const getCourseQA = (req, res) => {
    const course_id = req.params.id;

    try {
        const sql = `
        SELECT q.id AS question_id, q.question, q.created_at AS question_time,
               s.name AS student_name,
               a.answer, a.created_at AS answer_time,
               t.name AS teacher_name
        FROM course_questions q
        JOIN students s ON q.student_id = s.id
        LEFT JOIN course_answers a ON q.id = a.question_id
        LEFT JOIN teachers t ON a.teacher_id = t.id
        WHERE q.course_id = ?
        ORDER BY q.created_at DESC
    `;

        connection.query(sql, [course_id], (err, result) => {
            if (err) return res.status(500).json({ status: false, message: "DB error" });
            return res.status(200).json({ status: true, data: result });
        });
    } catch (err) {
        console.log(err)
        return res.status(500).json({ status: false, message: 'server error' })
    }
};


module.exports = { getCourseQA }
