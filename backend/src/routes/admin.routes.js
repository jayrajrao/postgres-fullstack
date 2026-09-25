const express = require("express");

const authenticateToken = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

const {
  getAllUsers,
  updateUserStatus,
  deleteUser,
} = require("../controllers/admin.controller");

const router = express.Router();

router.get(
  "/users",
  authenticateToken,
  requireAdmin,
  getAllUsers
);

router.patch(
  "/users/:id/status",
  authenticateToken,
  requireAdmin,
  updateUserStatus
);

router.delete(
  "/users/:id",
  authenticateToken,
  requireAdmin,
  deleteUser
);

module.exports = router;