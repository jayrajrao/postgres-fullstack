const pool = require("../config/db");
const cloudinary = require("../config/cloudinary");

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, age, role, status, profile_image, created_at
       FROM users
       WHERE id != $1
       ORDER BY id DESC`,
      [req.user.userId]
    );

    res.json({
      users: result.rows,
    });

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
  `SELECT id, name, email, age, role, status, profile_image, created_at
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


const getUserProfile = async (req, res) => {
  try {
    const viewerId = req.user.userId;
    const targetUserId = parseInt(req.params.id);

    if (!targetUserId) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // Apna khud ka profile dekh sakte ho
    if (viewerId === targetUserId) {
      const result = await pool.query(
        `SELECT
          id,
          name,
          email,
          age,
          role,
          status,
          profile_image,
          created_at
         FROM users
         WHERE id = $1`,
        [targetUserId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.json({
        user: result.rows[0],
      });
    }

    // Check: kya dono accepted friends hain?
    const friendshipResult = await pool.query(
      `SELECT id
       FROM friend_requests
       WHERE status = 'accepted'
       AND (
         (sender_id = $1 AND receiver_id = $2)
         OR
         (sender_id = $2 AND receiver_id = $1)
       )
       LIMIT 1`,
      [viewerId, targetUserId]
    );

    if (friendshipResult.rows.length === 0) {
      return res.status(403).json({
        message: "You can only view the profile of an accepted friend",
      });
    }

    // Friend hai → profile + photo return
    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        age,
        role,
        status,
        profile_image,
        created_at
       FROM users
       WHERE id = $1`,
      [targetUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};


module.exports = {
  getUsers,
  getProfile,
  updateProfile,
  uploadProfileImage,
  getUserProfile
};