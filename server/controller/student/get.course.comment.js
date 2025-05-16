// controller/comment/getAllComments.js (example path)
const connection = require("../../db"); // Adjust path if needed

const getAllComments = async (req, res) => {

    const sql = `
        SELECT 
               id ,         -- Assuming 'id' is the PK of course_comments
               comment,
               student_id,
               course_id,
               created_at,              -- Or whatever your timestamp column is named
               name AS student_name,     -- Or first_name, last_name if separate
               avatar AS student_avatar, -- Optional: if you have student avatars
               title AS course_title
        FROM course_comments 
        JOIN students  ON student_id = id  -- Make sure id is the correct PK for students
        JOIN courses  ON course_id = id    -- Make sure id is the correct PK for courses
        ORDER BY created_at DESC             -- Show newest comments first
    `;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error("DB Error fetching all comments:", err);
            // In a production app, you might not send the raw 'err' object
            return res.status(500).json({ status: false, message: "Database error while fetching comments." });
        }

        // You might want to format the data slightly if needed by the frontend
        const formattedResults = results.map(row => ({
            ...row,
            created_at: new Date(row.created_at).toISOString(), // Standardize date
            // student_avatar: row.student_avatar ? `BASE_AVATAR_URL/${row.student_avatar}` : null
        }));

        return res.status(200).json({ status: true, data: formattedResults });
    });
};

module.exports = { getAllComments };