const express = require("express");

const authenticateToken = require("../middleware/auth.middleware");

const {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} = require("../controllers/friend.controller");

const router = express.Router();

router.post(
  "/request/:userId",
  authenticateToken,
  sendFriendRequest
);

router.get(
  "/requests",
  authenticateToken,
  getFriendRequests
);

router.patch(
  "/request/:requestId/accept",
  authenticateToken,
  acceptFriendRequest
);

router.patch(
  "/request/:requestId/reject",
  authenticateToken,
  rejectFriendRequest
);

module.exports = router;