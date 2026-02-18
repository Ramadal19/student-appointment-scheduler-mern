const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      // Para advisors manuales puedes poner email también (recomendado),
      // pero lo dejamos como opcional para que puedas crear advisors sin email si quieres.
    },

    // Para login local (students)
    passwordHash: { type: String },

    // Para GitHub OAuth (students)
    githubId: { type: String, },

    // Cómo se autentica (o no se autentica)
    // advisor = creado manualmente, no inicia sesión
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

// Índices: email único solo si existe (sparse)
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ githubId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("User", userSchema);