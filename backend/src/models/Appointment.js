const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["requested", "confirmed", "canceled", "completed"],
      default: "requested",
      index: true,
    },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

// Evita doble booking (mismo advisor, mismo startTime) si no está cancelada
appointmentSchema.index(
  { advisorId: 1, startTime: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "canceled" } } }
);

module.exports = mongoose.model("Appointment", appointmentSchema);