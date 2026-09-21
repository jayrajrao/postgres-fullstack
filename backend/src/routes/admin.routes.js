const express = require("express");

const authenticateToken = require("../middleware/auth.middleware");
const requireAdmin = require("../middleware/admin.middleware");

const {
  getAllUsers,
} = require("../controllers/admin.controller");

const router = express.Router();

router.get(
  "/users",
  authenticateToken,
  requireAdmin,
  getAllUsers
);

module.exports = router;