const express = require("express");
const User = require("../models/User");
const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);
const router = express.Router();

router.post("/topics", async (req, res) => {
  try {
    const topics = await Topic.insertMany(
      [
        { title: "Course Planning", description: "Plan classes and degree path." },
        { title: "Academic Support", description: "Study strategies and tutoring resources." },
        { title: "Registration Issues", description: "Help with holds, enrollment, or errors." },
        { title: "Career Guidance", description: "Internships, resume tips, and career planning." }
      ],
      { ordered: false }
    );

    res.status(201).json({ inserted: topics.length, topics });
  } catch (err) {
    // Si ya existen (duplicados), insertMany puede lanzar error: igual sirve para seed
    res.status(200).json({ message: "Topics seed attempted (some may already exist).", error: err.message });
  }
});

// ⚠️ Solo para pruebas (luego lo quitamos o lo protegemos)
router.post("/advisor", async (req, res) => {
  try {
    const { name, email } = req.body;

    const advisor = await User.create({
      name,
      email: email || undefined,
      role: "advisor",
      provider: "manual",
      profileComplete: true,
    });

    res.status(201).json(advisor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


module.exports = router;