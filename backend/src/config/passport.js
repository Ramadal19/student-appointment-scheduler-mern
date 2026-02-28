// src/config/passport.js
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

// -------------------- Session serialize/deserialize --------------------
// Guardamos solo el ID en la sesión (recomendado)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Reconstruye req.user desde Mongo
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-passwordHash");
    done(null, user || null);
  } catch (err) {
    done(err);
  }
});

// -------------------- GitHub OAuth Strategy --------------------
const hasGithubOAuth =
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;

if (!hasGithubOAuth) {
  console.warn(
    "⚠️ GitHub OAuth disabled: missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET in .env"
  );
} else {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL:
          process.env.GITHUB_CALLBACK_URL ||
          "https://student-appointment-scheduler-mern.onrender.com/auth/github/callback",
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const githubId = String(profile.id);
          let user = await User.findOne({ githubId });

          const emailFromProfile =
            profile?.emails?.find((e) => e?.value)?.value ||
            profile?._json?.email ||
            null;

          if (!user) {
            user = await User.create({
              name: profile.displayName || profile.username || "GitHub User",
              email: emailFromProfile
                ? String(emailFromProfile).toLowerCase()
                : undefined,
              githubId,
              provider: "github",
              role: "student",
              profileComplete: Boolean(emailFromProfile),
            });
          } else {
            if (!user.email && emailFromProfile) {
              user.email = String(emailFromProfile).toLowerCase();
              user.profileComplete = true;
              await user.save();
            }
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
}