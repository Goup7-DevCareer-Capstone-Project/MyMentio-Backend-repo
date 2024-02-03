const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel")
const { generateToken } = require("./authMiddleware");


passport.serializeUser((user, done) => {
  // console.log(user)
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  // console.log(user)
  done(null, user);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      // Your authentication logic here
      // ...
      return done(null, profile);
    }
  )
);
module.exports = passport;
