const User = require("../models/userModel");
const Therapist = require("../models/therapistModel");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const { generateToken } = require("../middleware/authMiddleware");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../utils/sendMail");

/**
 * @desc Register User
 * @route POST
 * @route /api/user/register
 * @access Public
 */

const registerUser = asyncHandler(async (req, res) => {
  // validate request express-validator
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    res.status(400).json({
      success: false,
      message: validationError.array()[0].msg,
    });
    //throw new Error(validationError.array()[0].msg)
  }
  try {
    const { firstName, lastName, email, dateOfBirth, password, gender, bio } =
      req.body;

    const userExist = await User.findOne({ email });
    if (userExist) {
      res.status(403).json({
        success: false,
        message: "User already exist",
      });
    }

    const verifyToken = uuidv4();

    const user = await User.create({
      firstName,
      lastName,
      email,
      dateOfBirth,
      password,
      gender,
      bio,
      isGoogle: false,
      verificationCode: verifyToken,
    });

    if (user) {
      const text = `<h1>Email Confirmation</h1>
        <h2>Hello ${firstName}</h2>
        <p>Verify your email address to complete the signup and login to your account to Project-x</p>
        <a href='https://project-x-g8rg.onrender.com/api/user/register/${user.verificationCode}'> Click here</a> 

        </div>`;

      await sendEmail({
        email: user.email,
        subject: "Email Verification",
        message: text,
      });

      res.status(201).json({
        success: true,
        //user
      });
    }
  } catch (error) {
    res.status(500);
  }
});

const verifyAccount = asyncHandler(async (req, res) => {
  try {
    const code = req.params.code;
    // compare the confirmation code

    const verifyUser = await User.findOne({ verificationCode: code });

    if (!verifyUser) {
      //res.status(404);
      // throw new Error('User not found');
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    } else {
      verifyUser.isVerified = true;
      await verifyUser.save();
      res.redirect("https://project-xp.vercel.app/login"); //remember we are to replace this our own link same thing line 55
    }
  } catch (error) {
    res.status(500);
  }
});

/**
 * @desc Login a user
 * @route POST
 * @route /api/user/login
 * @access Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    res.status(400).json({
      success: false,
      message: validationError.array()[0].msg,
    });
  }
  const { email, password } = req.body;

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401).json({
      success: false,
      message: "Invalid Credentials",
    });
  }

  if (user.isVerified === false) {
    res.status(422).json({
      success: false,
      message: "Your account is not verified",
    });
  }
  if (user.isGoogle === true) {
    res.status(409).json({
      success: false,
      message: "Sign in using google",
    });
  }

  res.status(200).json({
    success: true,
    token: generateToken(user.id),
  });
});

const googleSignIn = asyncHandler(async (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successful",
      token: generateToken(req.user._id),
      //cookies: req.cookies
    });
  }
});
const googleFail = asyncHandler(async (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

// router.get("/login/success",
const userInfo = asyncHandler(async (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successful",
      user: req.user,
      //cookies: req.cookies
    });
  }
});

/**
 * @desc Get user profile
 * @route POST
 * @route /api/user/me
 * @access Private/User
 */

const getUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      // res.status(404)
      // throw new Error('User not found')
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500);
  }
});

/**
 * @desc Get therapist profile
 * @route POST
 * @route /api/user/me
 * @access Private/User
 */

const gettherapist = asyncHandler(async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.user.id);

    if (!therapist) {
      // res.status(404)
      // throw new Error('User not found')
      res.status(404).json({
        success: false,
        message: "therapist not found",
      });
    }
    res.status(200).json({
      success: true,
      therapist,
    });
  } catch (error) {
    res.status(500);
  }
});

/**
 * @desc Get therapists profile
 * @route POST
 * @route /api/user/me
 * @access Private/User
 */

const gettherapists = asyncHandler(async (req, res) => {
  try {
    const therapists = await Therapist.find();

    if (!therapists || therapists.length === 0 ) {
      // res.status(404)
      // throw new Error('User not found')
      res.status(404).json({
        success: false,
        message: "Therapists not found",
      });
    }
    res.status(200).json({
      success: true,
      therapists,
    });
  } catch (error) {
    res.status(500);
  }
});

/**
 * @desc Update a user
 * @route POST
 * @route /api/user/login
 * @access Public
 */
const updateUser = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;

    const updatedUser = await user.save();

    return res.json({
      success: true,
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * @desc Forgot Password
 * @route POST
 * @route /api/user/forgotpassword
 * @access Public
 */

const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    // res.status(404);
    // throw new Error('There is no user with that email');
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // create message to pass
  const text = `<h1>Password Reset Link</h1>
        <h2>Hello ${user.firstName}</h2>
        <p>You are receiving this email because you (or someone else) has
         requested the reset of a password</p>
          //  <a href='https://(insertprojectlink).onrender.com/api/user/resetpassword/${resetToken}'> Click here to reset your password</a> 

        </div>`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message: text,
    });

    res.status(200).json({
      success: true,
      message: "Email sent",
      resetToken,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      success: false,
      message: "Email could not be sent",
    });
  }
});

/**
 * @desc Reset User password
 * @route PUT
 * @route /api/user/resetpassword/:resettoken
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  //  Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // ?set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password Reset Successfully. Please Login with your new password",
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "User Logged Out" });
});

const lol = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "User Lol" });
});

module.exports = {
  registerUser,
  verifyAccount,
  loginUser,
  getUser,
  updateUser,
  forgotPassword,
  resetPassword,
  googleSignIn,
  googleFail,
  userInfo,
  logoutUser,
  lol,
  gettherapist,
  gettherapists
};
