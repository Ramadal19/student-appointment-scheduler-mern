const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
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

// -------------------- Local REGISTER --------------------
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "email and password are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "password must be at least 6 characters" });

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: "email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name?.trim() || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      passwordHash,
      provider: "local",
      role: "student",
      profileComplete: false,
    });

    req.login(user, (err) => {
      if (err) return next(err);

      res.status(201).json({
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
    next(err);
  }
});
// -------------------- Local LOGIN (email/password) --------------------
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    // Email no existe (o no es cuenta local)
    if (!user || !user.passwordHash) {
      return res.status(404).json({
        message: "No account found for this email. Please create one.",
        code: "USER_NOT_FOUND",
      });
    }

    // Email existe pero password incorrecto
    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        message: "Incorrect password. Please try again.",
        code: "BAD_PASSWORD",
      });
    }

    // crea sesión
    req.login(user, (err) => {
      if (err) return next(err);

      return res.json({
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
    next(err);
  }
});
// -------------------- Me --------------------
router.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ loggedIn: false });

  res.json({
    loggedIn: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      provider: req.user.provider,
      role: req.user.role,
    },
  });
});
// -------------------- Forgot Password (BASIC) --------------------
// POST /auth/forgot-password
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Si no existe, tu mensaje friendly
    if (!user) {
      return res.status(404).json({
        message: "No account registered. Please create one.",
        code: "USER_NOT_FOUND",
      });
    }

    // Genera token y expiración
    const token = crypto.randomBytes(32).toString("hex");

    // ✅ IMPORTANTE: estos campos deben existir en tu User model (abajo te digo)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hora
    await user.save();

    // Modo básico: devolvemos link para pruebas (en prod sería email)
    const resetUrl = `${FRONTEND.replace(/\/$/, "")}/reset-password/${token}`;

    return res.json({
      ok: true,
      resetUrl,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------- Reset Password (BASIC) --------------------
// POST /auth/reset-password/:token
router.post("/reset-password/:token", async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({ message: "password is required" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token invalid or expired",
        code: "BAD_TOKEN",
      });
    }

    // ✅ Tu sistema usa passwordHash (no password)
    user.passwordHash = await bcrypt.hash(String(password), 10);

    // limpia token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ ok: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});


// -------------------- Logout --------------------
router.post("/logout", (req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";

  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("sid", {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
      });
      res.json({ ok: true });
    });
  });
});

module.exports = router;