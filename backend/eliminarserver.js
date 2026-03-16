const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// -------------------- CORS --------------------
// permite localhost y tu frontend en Vercel
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://student-appointment-scheduler-mern.vercel.app",
    ],
    credentials: true,
  })
);

// -------------------- Middleware --------------------
app.use(express.json());

// -------------------- Routes --------------------

// Root test
app.get("/", (req, res) => {
  res.status(200).send("Backend server is running successfully 🚀");
});

// Health check (IMPORTANTE para probar en Render)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API running" });
});

app.get("/auth/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ loggedIn: false });
  }

  res.json({
    loggedIn: true,
    user: req.user.displayName || req.user.username,
  });
});

// -------------------- Server --------------------
const PORT = process.env.PORT || 5000;
// Dashboard API route
app.get("/api/appointments", (req, res) => {
  res.json([
    { id: 1, date: "2026-02-21", status: "confirmed" },
    { id: 2, date: "2026-02-22", status: "pending" },
    { id: 3, date: "2026-02-23", status: "confirmed" }
  ]);
});
// Start server
app.listen(PORT, () => {
  console.log(`✅ NEW SERVER FILE ACTIVE on port ${PORT}`);
});

