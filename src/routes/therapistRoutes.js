const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const { registerTherapist, verifyAccount, getTherapistProfile, loginTherapist, updateTherapistProfile, forgotPassword, resetPassword } = require ("../controllers/therapistController")
const { authenticate } = require("../middleware/authMiddleware");

// Login Therapist Route
router.post('/login', [
        check("email", "Please enter a valid email address").isEmail(),
        check("password", "valid password required").exists()
    ], loginTherapist);

//register Route
router.post('/register', [
    check("firstName", "Your firstname must be 3+ characters long").exists().isLength({ min: 3}),
    check("lastName", "Your lastname must be 3+ characters long").exists().isLength({ min: 3}),
    check("email", "Please enter a valid email address").exists().isEmail(),
    check("password", "Password required and must be a minimum of 8 characters").exists().isLength({ min : 8 })
], upload.single("cv"), registerTherapist);

// const CLIENT_URL = "https://(projectname).vercel.app"; //use frontend link 
// // const CLIENT_URL = "http://localhost:8000"

router.get("/register/:code", verifyAccount);
router.get("/me", authenticate, getTherapistProfile);
router.patch("/me", authenticate, updateTherapistProfile);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;