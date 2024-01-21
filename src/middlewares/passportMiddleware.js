const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
const { generateToken } = require("./authMiddleware");

passport.use(
  new GoogleStrategy(
    {
      callbackURL: process.env.CALLBACK_URL,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Check if user with same email or id exists in DB if not create one and save in DB
      //const token = jwt.sign({ email: profile.emails }, process.env.JWTSecretKey,{ expiresIn:'14d'});

      const currentUser = await User.findOne({
        email: profile.emails[0].value,
      });
      if (!currentUser) {
        const newUser = await User.create({
          email: profile.emails[0].value,
          firstName: profile.name.givenName || "john",
          lastName: profile.name.familyName || "doe",
          password: profile.id,
          isGoogle: true,
          isVerified: true,
        });
        // const token = generateToken(newUser.id)
        const user = newUser._id;
        return done(null, user);
      }
      if (!currentUser.isGoogle) {
        return done(null, false, {
          message: `You have previously signed up with a different signin method`,
        });
      }
      // const token = generateToken(currentUser.id)
      const user = currentUser._id;
      done(null, user);
    }
  )
);
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  // const currentUser = await User.findOne({
  //   _id,
  // });
  done(null, user);
});

module.exports = passport;
