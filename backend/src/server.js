// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const session = require("express-session");
const passport = require("passport");
require("./config/passport"); // registra la strategy de GitHub

const authRoutes = require("./routes/auth");

const app = express();

// -------------------- CORS --------------------
// Permite localhost (dev) y Vercel (prod)
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

// Render / proxies (NECESARIO para secure cookies detrás de proxy)
app.set("trust proxy", 1);

// -------------------- Session (cookie cross-site) --------------------
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET,
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

// Session check (para el Dashboard)
app.get("/auth/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ loggedIn: false });
  }

  res.json({
    loggedIn: true,
    user: req.user.displayName || req.user.username || "user",
  });
});

// -------------------- Server --------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});