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
      callbackURL: process.env.CALLBACK_URL,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      // console.log(profile)
      return done(null, profile);
    }
  )
);
module.exports = passport;
