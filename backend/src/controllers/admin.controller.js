const pool = require("../config/db");



const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET status = $1
       WHERE id = $2
       RETURNING id, name, email, role, status`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: `User ${status} successfully`,
      user: result.rows[0],
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Failed to update user status",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const offset = (page - 1) * limit;

    const usersResult = await pool.query(
      `SELECT id, name, email, age, role, status, profile_image, created_at
       FROM users
       ORDER BY id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users`
    );

    const totalUsers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users: usersResult.rows,
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
      },
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};


const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM users
       WHERE id = $1
       RETURNING id, name, email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User deleted successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Failed to delete user",
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserStatus,
  deleteUser
};                          