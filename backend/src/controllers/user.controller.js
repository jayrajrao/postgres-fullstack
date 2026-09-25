const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");
const getUsers = async (req, res) => {
  try {
   const result = await pool.query(
  `SELECT id, name, email, age, role, status, profile_image, created_at
   FROM users
   WHERE id = $1`,
  [req.user.userId]
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


const updateProfile = async (req, res) => {
  try {
    const { name, email, age } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET name = $1,
           email = $2,
           age = $3
       WHERE id = $4
       RETURNING id, name, email, age, role, status, profile_image, created_at`,
      [name, email, age || null, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error(error.message);

    // Duplicate email
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    const userId = req.user.userId;

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "fullstack-app/profile-images",
          public_id: `user-${userId}`,
          overwrite: true,
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    const result = await pool.query(
      `UPDATE users
       SET profile_image = $1
       WHERE id = $2
       RETURNING id, name, email, age, role, status, profile_image, created_at`,
      [uploadResult.secure_url, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "Profile image uploaded successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to upload profile image",
    });
  }
};
module.exports = {
  getUsers,
  getProfile,
  updateProfile,
  uploadProfileImage
};