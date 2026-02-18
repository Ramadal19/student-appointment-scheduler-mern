const express = require("express");
const mongoose = require("mongoose");

const Appointment = require("../models/Appointment");
const Availability = require("../models/Availability");

const router = express.Router();

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Populate completo para React (alineado a tus modelos)
const appointmentPopulate = [
  { path: "advisorId", select: "name email role" },
  { path: "studentId", select: "name email role profileComplete" },
  { path: "topicId", select: "title description" },
  { path: "availabilityId", select: "advisorId startTime endTime isBooked" },
];

// Guardrail lunch 12–1 (por si alguien crea slots por error)
function isLunchSlot(slot) {
  if (!slot?.startTime) return false;
  const d = new Date(slot.startTime);
  if (Number.isNaN(d.getTime())) return false;
  return d.getHours() === 12; // 12:00-12:59
}

/**
 * GET /appointments
 * Opcional: ?advisorId=...
 */
router.get("/", async (req, res) => {
  try {
    const { advisorId } = req.query;

    const filter = {};
    if (advisorId) {
      if (!isValidId(advisorId)) return res.status(400).json({ error: "Invalid advisorId" });
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
 * GET /appointments/student/:studentId
 * Temporal: “mis citas”; luego será /appointments/my usando req.user._id
 */
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!isValidId(studentId)) return res.status(400).json({ error: "Invalid studentId" });

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
 * Body: { studentId, advisorId, topicId, availabilityId, notes? }
 *
 * - Valida que el slot exista y pertenezca al advisor
 * - Evita double booking (lock isBooked + unique availabilityId + índice parcial)
 * - Bloquea lunch 12–1
 * - Devuelve appointment con populate para React
 */
router.post("/", async (req, res) => {
  const { studentId, advisorId, topicId, availabilityId, notes } = req.body;

  // Requeridos + ObjectId
  const required = { studentId, advisorId, topicId, availabilityId };
  for (const [k, v] of Object.entries(required)) {
    if (!v) return res.status(400).json({ error: `Missing field: ${k}` });
    if (!isValidId(v)) return res.status(400).json({ error: `Invalid ObjectId for ${k}` });
  }

  const session = await mongoose.startSession();

  try {
    let createdId = null;

    await session.withTransaction(async () => {
      // 0) Validar slot existe
      const slotCheck = await Availability.findById(availabilityId).session(session);
      if (!slotCheck) throw Object.assign(new Error("SLOT_NOT_FOUND"), { statusCode: 404 });

      // 0a) Slot pertenece al advisor
      if (String(slotCheck.advisorId) !== String(advisorId)) {
        throw Object.assign(new Error("SLOT_DOES_NOT_BELONG_TO_ADVISOR"), { statusCode: 400 });
      }

      // 5) Lunch guardrail
      if (isLunchSlot(slotCheck)) {
        throw Object.assign(new Error("LUNCH_HOUR_NOT_BOOKABLE"), { statusCode: 409 });
      }

      // 1) Lock del slot (solo si no está reservado)
      const lockedSlot = await Availability.findOneAndUpdate(
        { _id: availabilityId, advisorId, isBooked: false },
        { $set: { isBooked: true } },
        { new: true, session }
      );

      if (!lockedSlot) {
        throw Object.assign(new Error("SLOT_NOT_AVAILABLE"), { statusCode: 409 });
      }

      // 2) Crear appointment (status enum: requested/confirmed/canceled/completed)
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
    // Duplicados (availabilityId unique o índice parcial por advisorId/startTime)
    if (err?.code === 11000) {
      return res.status(409).json({
        error: "Duplicate booking detected (slot already has an appointment).",
      });
    }

    if (err.message === "SLOT_NOT_FOUND") return res.status(404).json({ error: "Slot not found" });
    if (err.message === "SLOT_DOES_NOT_BELONG_TO_ADVISOR")
      return res.status(400).json({ error: "Slot does not belong to the given advisorId" });
    if (err.message === "LUNCH_HOUR_NOT_BOOKABLE")
      return res.status(409).json({ error: "Lunch hour (12–1) is not bookable." });
    if (err.message === "SLOT_NOT_AVAILABLE")
      return res.status(409).json({ error: "Slot not available (already booked or invalid)." });

    return res.status(err.statusCode || 500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

/**
 * PATCH /appointments/:id/cancel
 * Cancela y libera Availability.isBooked=false
 * (Endpoint único: elimina DELETE duplicado)
 */
router.patch("/:id/cancel", async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return res.status(400).json({ error: "Invalid appointment id" });

  const session = await mongoose.startSession();

  try {
    let targetId = null;

    await session.withTransaction(async () => {
      const appt = await Appointment.findById(id).session(session);
      if (!appt) throw Object.assign(new Error("APPT_NOT_FOUND"), { statusCode: 404 });

      // Idempotente
      if (appt.status === "canceled") {
        targetId = appt._id;
        return;
      }

      // (opcional) si no quieres permitir cancelar completed, descomenta:
      // if (appt.status === "completed") {
      //   throw Object.assign(new Error("CANNOT_CANCEL_COMPLETED"), { statusCode: 409 });
      // }

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
    if (err.message === "APPT_NOT_FOUND") return res.status(404).json({ error: "Appointment not found" });

    // if (err.message === "CANNOT_CANCEL_COMPLETED")
    //   return res.status(409).json({ error: "Cannot cancel a completed appointment" });

    return res.status(err.statusCode || 500).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;