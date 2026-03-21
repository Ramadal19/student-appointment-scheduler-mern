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
    availabilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Availability",
      required: true,
      unique: true
    },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["confirmed", "canceled", "completed"],
      default: "confirmed",
      index: true,
  },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

// Prevent duplicate bookings for the same advisor and start time unless canceled
appointmentSchema.index(
  { advisorId: 1, startTime: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "canceled" } } }
);

module.exports = mongoose.model("Appointment", appointmentSchema);