const express = require("express");
const Topic = require("../models/Topics"); 

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const topics = await Topic.find().sort({ title: 1 });
    return res.json(topics);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;