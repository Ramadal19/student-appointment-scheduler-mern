const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.patch("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (user.provider !== "local") {
      return res.status(400).json({
        message: "Password changes must be managed through GitHub.",
      });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        message: "This account does not have a local password set.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;

    await user.save();

    return res.json({
      message: "Password updated successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Failed to update password.",
    });
  }
});

module.exports = router;