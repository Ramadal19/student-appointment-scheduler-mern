// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const session = require("express-session");
const passport = require("passport");
require("./config/passport"); // registra strategy + serialize/deserialize (debe existir)

const authRoutes = require("./routes/auth");

const app = express();

// -------------------- CORS --------------------
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://student-appointment-scheduler-mern.vercel.app",
    ],
    credentials: true,
  })
);

// -------------------- Middleware base --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Render / proxies (NECESARIO para secure cookies detrás de proxy)
app.set("trust proxy", 1);

// -------------------- MongoDB --------------------
async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn("⚠️ MONGO_URI no está definido. El server correrá SIN DB.");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    // En producción, mejor fallar rápido para que Render reinicie
    process.exit(1);
  }
}
connectMongo();

// -------------------- Session (cookie cross-site) --------------------
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    proxy: true,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: true,       // HTTPS (Render)
      sameSite: "none",   // Cross-site (Vercel -> Render)
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
    },
  })
);

// -------------------- Passport --------------------
app.use(passport.initialize());
app.use(passport.session());

// -------------------- Routes --------------------
app.use("/auth", authRoutes);

// Root test
app.get("/", (req, res) => {
  res.status(200).send("Backend server is running successfully 🚀");
});

// Health check (IMPORTANTE para Render)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API running" });
});

// -------------------- 404 handler --------------------
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Route not found" });
});

// -------------------- Error handler (JSON, NO HTML) --------------------
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);

  // ejemplo: errores de Mongo unique index (E11000)
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
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});