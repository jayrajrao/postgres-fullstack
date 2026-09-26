const express = require("express");

const authenticateToken = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const {
  getUsers,
  getProfile,
  updateProfile,
  uploadProfileImage,
  getUserProfile,
} = require("../controllers/user.controller");

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  getUsers
);

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

router.get(
  "/:id/profile",
  authenticateToken,
  getUserProfile
);
module.exports = router;