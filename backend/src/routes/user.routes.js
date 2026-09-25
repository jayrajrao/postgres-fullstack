const express = require("express");

const authenticateToken = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const {
  getUsers,
  getProfile,
  updateProfile,
  uploadProfileImage,
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/", getUsers);

router.get(
  "/profile",
  authenticateToken,
  getProfile
);
router.patch(
  "/profile",
  authenticateToken,
  updateProfile
);
router.patch(
  "/profile/image",
  authenticateToken,
  upload.single("profileImage"),
  uploadProfileImage
);
module.exports = router;