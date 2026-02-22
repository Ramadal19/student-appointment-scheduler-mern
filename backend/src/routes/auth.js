const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

const FRONTEND =
  process.env.FRONTEND_URL || "https://student-appointment-scheduler-mern.vercel.app";

// -------------------- GitHub OAuth --------------------
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${FRONTEND}/login`,
    session: true,
  }),
  (req, res) => {
    res.redirect(`${FRONTEND}/dashboard`);
  }
);

// -------------------- Local REGISTER (email/password) --------------------
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ message: "password must be at least 6 characters" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "email already in use" });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await User.create({
      name: name?.trim() || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      passwordHash,
      provider: "local",
      role: "student",
      profileComplete: false,
    });

    // crea sesión (cookie) igual que con GitHub
    req.login(user, (err) => {
      if (err) return next(err);

      return res.status(201).json({
        ok: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          provider: user.provider,
        },
      });
    });
  } catch (err) {
    return next(err);
  }
});

// -------------------- Me (session check) --------------------
router.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ loggedIn: false });

  res.json({
    loggedIn: true,
    user: req.user.name || req.user.displayName || req.user.username || "user",
  });
});

// -------------------- Logout --------------------
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("sid", { sameSite: "none", secure: true });
      res.json({ ok: true });
    });
  });
});

module.exports = router;