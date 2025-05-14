const connection = require("../../db");


const addCategory = async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Category name is required." });
    }

    const sql = "INSERT INTO categories (name, description) VALUES (?, ?)";

    connection.query(sql, [name, description], (err, result) => {
        if (err) {
            console.error("Error inserting category:", err);
            return res.status(500).json({ message: "Server error. Could not add category." });
        }

        res.status(201).json({ message: "Category added successfully.", categoryId: result.insertId });
    });
}

module.exports = { addCategory }