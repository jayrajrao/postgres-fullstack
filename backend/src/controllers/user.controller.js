const pool = require("../config/db");

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, age, created_at
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

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, age, created_at
       FROM users
       WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

module.exports = {
  getUsers,
  getProfile,
};