const express = require("express");
const passport = require("passport");

const router = express.Router();

// Inicia OAuth con GitHub
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// Callback de GitHub
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.FRONTEND_URL || "https://student-appointment-scheduler-mern.vercel.app"}/login`,
    session: true,
  }),
  (req, res) => {
    res.redirect(
      `${process.env.FRONTEND_URL || "https://student-appointment-scheduler-mern.vercel.app"}/dashboard`
    );
  }
);

module.exports = router;