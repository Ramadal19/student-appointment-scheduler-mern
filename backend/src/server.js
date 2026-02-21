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
const session = require("express-session");
const passport = require("passport");
require("./config/passport"); // ✅ registra la strategy


// -------------------- Middleware --------------------
app.use(express.json());
app.set("trust proxy", 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Render = true
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
// -------------------- Routes --------------------

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Root test
app.get("/", (req, res) => {
  res.status(200).send("Backend server is running successfully 🚀");
});

// Health check (IMPORTANTE para probar en Render)
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API running" });
});


// -------------------- Server --------------------
const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`✅ NEW SERVER FILE ACTIVE on port ${PORT}`);
});
