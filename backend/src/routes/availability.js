const express = require("express");
const mongoose = require("mongoose");
const Availability = require("../models/Availability");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

function getNextMonday(base = new Date()) {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);

  const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diff = (8 - day) % 7;

  d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
  return d;
}

// GET /api/availability?advisorId=...&from=...&to=...
router.get("/", async (req, res) => {
  try {
    const { advisorId, from, to } = req.query;

    if (!advisorId) {
      return res.status(400).json({ error: "advisorId is required" });
    }

    const filter = {
      advisorId,
      isBooked: false,
    };

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

// GET /api/availability/table/:advisorId
router.get("/table/:advisorId", async (req, res) => {
  try {
    const slots = await Availability.find({
      advisorId: req.params.advisorId,
    }).sort({ startTime: 1 });

    const table = slots.map((s) => ({
      day: s.startTime.toLocaleDateString(),
      time: `${s.startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${s.endTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      status: s.isBooked ? "BUSY" : "AVAILABLE",
    }));

    res.json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/availability/seed
router.post("/seed", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { advisorId } = req.body;

    if (!advisorId) {
      return res.status(400).json({ error: "advisorId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(advisorId)) {
      return res.status(400).json({ error: "Invalid advisorId" });
    }

    const advisorObjectId = new mongoose.Types.ObjectId(advisorId);
    const startDate = getNextMonday();

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 5);

    const existingSlots = await Availability.countDocuments({
      advisorId: advisorObjectId,
      startTime: {
        $gte: startDate,
        $lt: endDate,
      },
    });

    if (existingSlots > 0) {
      return res.status(409).json({
        error: "Availability already exists for the upcoming week.",
        weekStartsOn: startDate,
        existingSlots,
      });
    }

    // Required time slots:
    // 8-9, 9-10, 10-11, 11-12, 1-2, 2-3, 3-4, 4-5
    const HOURS = [8, 9, 10, 11, 13, 14, 15, 16];

    const slots = [];

    for (let day = 0; day < 5; day++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + day);

      for (const hour of HOURS) {
        const startTime = new Date(currentDay);
        startTime.setHours(hour, 0, 0, 0);

        const endTime = new Date(currentDay);
        endTime.setHours(hour + 1, 0, 0, 0);

        slots.push({
          advisorId: advisorObjectId,
          startTime,
          endTime,
          isBooked: false,
        });
      }
    }

    const result = await Availability.insertMany(slots);

    res.status(201).json({
      message: "Availability created",
      count: result.length,
      weekStartsOn: startDate,
      weekEndsBefore: endDate,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        error: "Some availability slots already exist for the upcoming week.",
      });
    }

    res.status(500).json({ error: err.message });
  }
});

module.exports = router;