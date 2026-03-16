const express = require("express");
const mongoose = require("mongoose");

const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Populate completo para React
const appointmentPopulate = [
  { path: "advisorId", select: "name email role" },
  { path: "studentId", select: "name email role profileComplete" },
  { path: "topicId", select: "title description" },
  { path: "availabilityId", select: "advisorId startTime endTime isBooked" },
];

// Guardrail lunch 12–1
function isLunchSlot(slot) {
  if (!slot?.startTime) return false;
  const d = new Date(slot.startTime);
  if (Number.isNaN(d.getTime())) return false;
  return d.getHours() === 12;
}

/**
 * GET /appointments
 * Admin/advisor only
 * Opcional: ?advisorId=...
 */
router.get("/", requireAuth, requireRole("admin", "advisor"), async (req, res) => {
  try {
    const { advisorId } = req.query;
    const filter = {};

    if (req.user.role === "advisor") {
      filter.advisorId = req.user._id;
    }

    if (advisorId) {
      if (!isValidId(advisorId)) {
        return res.status(400).json({ error: "Invalid advisorId" });
      }

      if (req.user.role === "advisor" && String(req.user._id) !== String(advisorId)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      filter.advisorId = advisorId;
    }

    const appts = await Appointment.find(filter)
      .populate(appointmentPopulate)
      .sort({ startTime: 1 });

    return res.json(appts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /appointments/my
 * Mis citas del usuario autenticado
 */
router.get("/my", requireAuth, async (req, res) => {
  try {
    const appts = await Appointment.find({ studentId: req.user._id })
      .populate(appointmentPopulate)
      .sort({ startTime: 1 });

    return res.json(appts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /appointments/student/:studentId
 * Mantener temporalmente, pero solo admin
 */
router.get("/student/:studentId", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) {
      return res.status(400).json({ error: "Invalid studentId" });
    }

    const appts = await Appointment.find({ studentId })
      .populate(appointmentPopulate)
      .sort({ startTime: 1 });

    return res.json(appts);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /appointments
 * Body: { advisorId, topicId, availabilityId, notes? }
 * studentId sale de req.user._id
 */
router.post("/", requireAuth, requireRole("student"), async (req, res) => {
  const { advisorId, topicId, availabilityId, notes } = req.body;
  const studentId = req.user._id;

  const required = { advisorId, topicId, availabilityId };
  for (const [k, v] of Object.entries(required)) {
    if (!v) return res.status(400).json({ error: `Missing field: ${k}` });
    if (!isValidId(v)) return res.status(400).json({ error: `Invalid ObjectId for ${k}` });
  }

  const session = await mongoose.startSession();

  try {
    let createdId = null;

    await session.withTransaction(async () => {
      const slotCheck = await Availability.findById(availabilityId).session(session);
      if (!slotCheck) {
        throw Object.assign(new Error("SLOT_NOT_FOUND"), { statusCode: 404 });
      }

      if (String(slotCheck.advisorId) !== String(advisorId)) {
        throw Object.assign(new Error("SLOT_DOES_NOT_BELONG_TO_ADVISOR"), { statusCode: 400 });
      }

      if (isLunchSlot(slotCheck)) {
        throw Object.assign(new Error("LUNCH_HOUR_NOT_BOOKABLE"), { statusCode: 409 });
      }

      const lockedSlot = await Availability.findOneAndUpdate(
        { _id: availabilityId, advisorId, isBooked: false },
        { $set: { isBooked: true } },
        { new: true, session }
      );

      if (!lockedSlot) {
        throw Object.assign(new Error("SLOT_NOT_AVAILABLE"), { statusCode: 409 });
      }

      const appt = await Appointment.create(
        [
          {
            studentId,
            advisorId,
            topicId,
            availabilityId,
            startTime: lockedSlot.startTime,
            endTime: lockedSlot.endTime,
            status: "confirmed",
            notes: notes || "",
          },
        ],
        { session }
      );

      createdId = appt[0]._id;
    });

    const populated = await Appointment.findById(createdId).populate(appointmentPopulate);
    return res.status(201).json(populated);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        error: "Duplicate booking detected (slot already has an appointment).",
      });
    }

    if (err.message === "SLOT_NOT_FOUND") {
      return res.status(404).json({ error: "Slot not found" });
    }

    if (err.message === "SLOT_DOES_NOT_BELONG_TO_ADVISOR") {
      return res.status(400).json({ error: "Slot does not belong to the given advisorId" });
    }

    if (err.message === "LUNCH_HOUR_NOT_BOOKABLE") {
      return res.status(409).json({ error: "Lunch hour (12–1) is not bookable." });
    }

    if (err.message === "SLOT_NOT_AVAILABLE") {
      return res.status(409).json({ error: "Slot not available (already booked or invalid)." });
    }

    return res.status(err.statusCode || 500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

/**
 * PATCH /appointments/:id/cancel
 * Student dueño, advisor relacionado o admin
 */
router.patch("/:id/cancel", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: "Invalid appointment id" });

  const session = await mongoose.startSession();

  try {
    let targetId = null;

    await session.withTransaction(async () => {
      const appt = await Appointment.findById(id).session(session);
      if (!appt) {
        throw Object.assign(new Error("APPT_NOT_FOUND"), { statusCode: 404 });
      }

      const isOwner = String(appt.studentId) === String(req.user._id);
      const isAdvisor = String(appt.advisorId) === String(req.user._id);
      const isAdmin = req.user.role === "admin";

      if (!isOwner && !isAdvisor && !isAdmin) {
        throw Object.assign(new Error("FORBIDDEN"), { statusCode: 403 });
      }

      if (appt.status === "canceled") {
        targetId = appt._id;
        return;
      }

      const shouldRelease = appt.status === "confirmed" || appt.status === "requested";

      appt.status = "canceled";
      await appt.save({ session });

      if (shouldRelease && appt.availabilityId) {
        await Availability.updateOne(
          { _id: appt.availabilityId },
          { $set: { isBooked: false } },
          { session }
        );
      }

      targetId = appt._id;
    });

    const populated = await Appointment.findById(targetId).populate(appointmentPopulate);
    return res.json(populated);
  } catch (err) {
    if (err.message === "APPT_NOT_FOUND") {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.status(err.statusCode || 500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;