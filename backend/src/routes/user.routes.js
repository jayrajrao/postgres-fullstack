const express = require("express");

const authenticateToken = require("../middleware/auth.middleware");

const {
  getUsers,
  getProfile,
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/", getUsers);

router.get(
  "/profile",
  authenticateToken,
  getProfile
);

module.exports = router;