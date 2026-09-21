const pool = require("../config/db");

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, age, role, created_at
       FROM users
       ORDER BY id`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

module.exports = {
  getAllUsers,
};                          