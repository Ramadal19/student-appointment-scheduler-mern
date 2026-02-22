const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true }, // ← ya NO required

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // Login local (students)
    passwordHash: { type: String },

    // GitHub OAuth (students)
    githubId: { type: String },

    provider: {
      type: String,
      enum: ["local", "github", "manual"],
      default: "manual",
    },

    role: {
      type: String,
      enum: ["student", "advisor", "admin"],
      required: true,
      default: "student",
    },

    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// índices únicos solo si existe el campo
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ githubId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("User", userSchema);