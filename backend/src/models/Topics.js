const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: "", trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);