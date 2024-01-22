const express = require("express");
const passport = require("passport");
const router = express.Router();
const { check } = require("express-validator");
const {
  loginUser,
  registerUser,
  verifyAccount,
  getUser,
  updateUser,
  forgotPassword,
  resetPassword,
  googleFail,
  googleSignIn,
  gettherapists,
  gettherapist
} = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

// Login User Route
router.post('/login', [
        check("email", "Please enter a valid email address").isEmail(),
        check("password", "valid password required").exists()
    ], loginUser);

//register Route
router.post('/register', [
    check("firstName", "Your firstname must be 3+ characters long").exists().isLength({ min: 3}),
    check("lastName", "Your lastname must be 3+ characters long").exists().isLength({ min: 3}),
    check("email", "Please enter a valid email address").exists().isEmail(),
    check("password", "Password required and must be a minimum of 8 characters").exists().isLength({ min : 8 })
], registerUser);

const CLIENT_URL = "https://(projectname).vercel.app"; //use frontend link 
// const CLIENT_URL = "http://localhost:8000"

router.get("/login/success", googleSignIn);

router.get("/login/failed", googleFail);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(CLIENT_URL);
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

router.get("/register/:code", verifyAccount);
router.get("/me", authenticate, getUser);
router.get("/me", authenticate, gettherapist);
router.get("/me", authenticate, gettherapists);
router.patch("/me", authenticate, updateUser);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;