const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    isBooked: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Evita duplicados del mismo slot para el mismo advisor
availabilitySchema.index({ advisorId: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model("Availability", availabilitySchema);