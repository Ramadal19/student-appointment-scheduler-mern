// src/server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const session = require("express-session");
const passport = require("passport");
require("./config/passport"); // strategy + serialize/deserialize

const authRoutes = require("./routes/auth");
const advisorRoutes = require("./routes/advisors");
const appointmentRoutes = require("./routes/appointments"); // ✅ NUEVO

const app = express();

// -------------------- Env helpers --------------------
const isProd = process.env.NODE_ENV === "production";

// -------------------- CORS --------------------
const FRONTEND =
  process.env.FRONTEND_URL ||
  "https://student-appointment-scheduler-mern.vercel.app";

app.use(
  cors({
    origin: ["http://localhost:3000", FRONTEND],
    credentials: true,
  })
);

// -------------------- Middleware base --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Render proxy (solo en producción para cookies secure)
if (isProd) app.set("trust proxy", 1);

// -------------------- MongoDB --------------------
mongoose.set("bufferCommands", false);

(async function connectMongo() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI missing");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
})();

// -------------------- Session --------------------
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    proxy: isProd, // ✅ true solo en producción
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: isProd, // ✅ local: false (HTTP), prod: true (HTTPS)
      sameSite: isProd ? "none" : "lax", // ✅ local: lax, prod: none (cross-site)
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

// -------------------- Passport --------------------
app.use(passport.initialize());
app.use(passport.session());

// -------------------- Routes --------------------
app.use("/auth", authRoutes);
app.use("/api/advisors", advisorRoutes);
app.use("/api/appointments", appointmentRoutes); // ✅ NUEVO (GET/POST/PATCH cancel)

app.get("/", (req, res) =>
  res.status(200).send("Backend server is running 🚀")
);

app.get("/api/health", (req, res) => res.json({ ok: true, message: "API running" }));

// -------------------- 404 --------------------
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Route not found" });
});

// -------------------- Error handler (JSON) --------------------
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);

  if (err?.code === 11000) {
    return res.status(409).json({
      ok: false,
      message: "Duplicate key (email/githubId already exists)",
      details: err.keyValue,
    });
  }

  res.status(err.status || 500).json({
    ok: false,
    message: err.message || "Internal Server Error",
  });
});

// -------------------- Server --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));