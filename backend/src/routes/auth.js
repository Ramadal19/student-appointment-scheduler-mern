const express = require("express");
const passport = require("passport");

const router = express.Router();

// 1) Inicia OAuth con GitHub
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// 2) Callback (GitHub regresa aquí)
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: true,
  }),
  (req, res) => {
    // ✅ Si todo bien, manda al dashboard (luego lo creamos)
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

module.exports = router;