const express = require("express");
const Availability = require("../models/Availability");

const router = express.Router();

// GET /availability?advisorId=...&from=...&to=...
router.get("/", async (req, res) => {
  try {
    const { advisorId, from, to } = req.query;
    if (!advisorId) return res.status(400).json({ error: "advisorId is required" });

    const filter = { advisorId, isBooked: false };

    // Filtros opcionales por rango
    if (from || to) {
      filter.startTime = {};
      if (from) filter.startTime.$gte = new Date(from);
      if (to) filter.startTime.$lte = new Date(to);
    }

    const slots = await Availability.find(filter)
      .select("_id advisorId startTime endTime isBooked")
      .sort({ startTime: 1 });

    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/table/:advisorId", async (req, res) => {
  const slots = await Availability.find({ advisorId: req.params.advisorId })
    .sort({ startTime: 1 });

  const table = slots.map(s => ({
    day: s.startTime.toLocaleDateString(),
    time: s.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: s.isBooked ? "BUSY" : "AVAILABLE"
  }));

  res.json(table);
});
module.exports = router;