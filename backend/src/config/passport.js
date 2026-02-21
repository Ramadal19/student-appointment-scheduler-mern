const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

// ✅ Serialización básica (para session)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "https://student-appointment-scheduler-mern.onrender.com/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Por ahora guardamos el profile tal cual.
      // Luego lo conectamos con Mongo (User model).
      return done(null, profile);
    }
  )
);

module.exports = passport;