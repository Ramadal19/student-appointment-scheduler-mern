const express = require("express");
const passport = require("passport");

const router = express.Router();

const FRONTEND =
  process.env.FRONTEND_URL || "https://student-appointment-scheduler-mern.vercel.app";

// Inicia OAuth con GitHub
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// Callback de GitHub
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${FRONTEND}/login`,
    session: true,
  }),
  (req, res) => {
    // Si llegaste aquí, la sesión ya está creada
    res.redirect(`${FRONTEND}/dashboard`);
  }
);

// ✅ Verifica sesión (para Dashboard)
router.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ loggedIn: false });

  res.json({
    loggedIn: true,
    user: req.user.displayName || req.user.username || "user",
  });
});

// ✅ Logout (destruye sesión y limpia cookie)
router.post("/logout", (req, res, next) => {
  // Passport 0.6+ requiere callback
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      // IMPORTANTE: mismo nombre de cookie que pusiste en session(): name: "sid"
      res.clearCookie("sid", { sameSite: "none", secure: true });
      res.json({ ok: true });
    });
  });
});

module.exports = router;