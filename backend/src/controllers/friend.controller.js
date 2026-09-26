const pool = require("../config/db");

const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const receiverId = parseInt(req.params.userId);

    // 1. Invalid user ID
    if (!receiverId) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    // 2. Khud ko request nahi bhej sakte
    if (senderId === receiverId) {
      return res.status(400).json({
        message: "You cannot send request to yourself",
      });
    }

    // 3. Receiver exist karta hai ya nahi
    const receiverResult = await pool.query(
      `SELECT id, status
       FROM users
       WHERE id = $1`,
      [receiverId]
    );

    if (receiverResult.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // 4. Inactive user ko request nahi bhej sakte
    if (receiverResult.rows[0].status !== "active") {
      return res.status(400).json({
        message: "Cannot send request to inactive user",
      });
    }

    // 5. Already request check
    const existingRequest = await pool.query(
      `SELECT id, status
       FROM friend_requests
       WHERE sender_id = $1
       AND receiver_id = $2`,
      [senderId, receiverId]
    );

    if (existingRequest.rows.length > 0) {
      const request = existingRequest.rows[0];

      if (request.status === "pending") {
        return res.status(400).json({
          message: "Friend request already sent",
        });
      }

      if (request.status === "accepted") {
        return res.status(400).json({
          message: "You are already friends",
        });
      }

      // rejected request ko dobara pending kar sakte hain
      const updatedRequest = await pool.query(
        `UPDATE friend_requests
         SET status = 'pending',
             created_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [request.id]
      );

      return res.status(200).json({
        message: "Friend request sent again",
        request: updatedRequest.rows[0],
      });
    }

    // 6. Reverse request check
    const reverseRequest = await pool.query(
      `SELECT id, status
       FROM friend_requests
       WHERE sender_id = $1
       AND receiver_id = $2`,
      [receiverId, senderId]
    );

    if (
      reverseRequest.rows.length > 0 &&
      reverseRequest.rows[0].status === "pending"
    ) {
      return res.status(400).json({
        message: "This user has already sent you a friend request",
      });
    }

    // 7. New request create
    const result = await pool.query(
      `INSERT INTO friend_requests
       (sender_id, receiver_id)
       VALUES ($1, $2)
       RETURNING *`,
      [senderId, receiverId]
    );

    res.status(201).json({
      message: "Friend request sent successfully",
      request: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to send friend request",
    });
  }
};


const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT
          fr.id,
          fr.sender_id,
          fr.receiver_id,
          fr.status,
          fr.created_at,
          u.name AS sender_name,
          u.email AS sender_email,
          u.profile_image AS sender_profile_image
       FROM friend_requests fr
       JOIN users u
         ON u.id = fr.sender_id
       WHERE fr.receiver_id = $1
         AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [userId]
    );

    res.json({
      requests: result.rows,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch friend requests",
    });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const requestId = parseInt(req.params.requestId);

    if (!requestId) {
      return res.status(400).json({
        message: "Invalid request ID",
      });
    }

    // Sirf receiver hi request accept kar sakta hai
    const requestResult = await pool.query(
      `SELECT id, sender_id, receiver_id, status
       FROM friend_requests
       WHERE id = $1`,
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }

    const request = requestResult.rows[0];

    // Check: current user receiver hai?
    if (request.receiver_id !== userId) {
      return res.status(403).json({
        message: "You cannot accept this friend request",
      });
    }

    // Already accepted?
    if (request.status === "accepted") {
      return res.status(400).json({
        message: "Friend request already accepted",
      });
    }

    // Sirf pending request accept hogi
    if (request.status !== "pending") {
      return res.status(400).json({
        message: "This friend request is no longer pending",
      });
    }

    // Accept request
    const result = await pool.query(
      `UPDATE friend_requests
       SET status = 'accepted'
       WHERE id = $1
       RETURNING id, sender_id, receiver_id, status, created_at`,
      [requestId]
    );

    res.json({
      message: "Friend request accepted successfully",
      request: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to accept friend request",
    });
  }
};


const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.userId;
    const requestId = parseInt(req.params.requestId);

    if (!requestId) {
      return res.status(400).json({
        message: "Invalid request ID",
      });
    }

    // Request find karo
    const requestResult = await pool.query(
      `SELECT id, sender_id, receiver_id, status
       FROM friend_requests
       WHERE id = $1`,
      [requestId]
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({
        message: "Friend request not found",
      });
    }

    const request = requestResult.rows[0];

    // Sirf receiver reject kar sakta hai
    if (request.receiver_id !== userId) {
      return res.status(403).json({
        message: "You cannot reject this friend request",
      });
    }

    // Pending request hi reject hogi
    if (request.status !== "pending") {
      return res.status(400).json({
        message: "This friend request is no longer pending",
      });
    }

    // Reject request
    const result = await pool.query(
      `UPDATE friend_requests
       SET status = 'rejected'
       WHERE id = $1
       RETURNING id, sender_id, receiver_id, status, created_at`,
      [requestId]
    );

    res.json({
      message: "Friend request rejected successfully",
      request: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to reject friend request",
    });
  }
};

module.exports = {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest
};