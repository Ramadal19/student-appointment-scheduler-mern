const express = require("express");
const User = require("../models/User");

const router = express.Router();

// GET /advisors  -> list all advisors (id, name, email)
router.get("/", async (req, res) => {
  try {
    const advisors = await User.find({ role: "advisor" })
      .select("_id name email")
      .sort({ name: 1 });

    res.json(advisors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;