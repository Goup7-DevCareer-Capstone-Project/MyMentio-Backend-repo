const Therapist = require("../models/therapistModel");
const { validationResult } = require("express-validator");
const { generateToken } = require("../middlewares/authMiddleware");
const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const { sendEmail } = require("../utils/sendMail");

/**
 * @desc Register Therapist
 * @route POST
 * @route /api/therapist/register
 * @access Public
 */
const registerTherapist = asyncHandler(async (req, res) => {
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
    const {
      firstName,
      lastName,
      email,
      profileImage,
      officeAddress,
      phoneNumber,
      password,
      gender,
      bio,
      expertise,
    } = req.body;

    const therapistExist = await Therapist.findOne({ email });
    if (therapistExist) {
      res.status(403).json({
        success: false,
        message: "Therapist already exist",
      });
    }

    const verifyToken = uuidv4();

    const therapist = await Therapist.create({
      title,
      firstName,
      lastName,
      email,
      gender,
      password,
      profileImage,
      officeAddress,
      phoneNumber,
      expertise,
      bio,
      isGoogle: false,
      verificationCode: verifyToken,
      // cv: req.file.buffer,
    });

    if (user) {
      const text = `<h1>Email Confirmation</h1>
        <h2>Hello ${firstName}</h2>
        <p>Verify your email address to complete the signup and login to your account to My Mentio</p>
        <a href='https://mymentio-backend.onrender.com/api/user/register/${therapist.verificationCode}'> Click here</a> 

        </div>`;

      await sendEmail({
        email: therapist.email,
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

    const verifyTherapist = await Therapist.findOne({ verificationCode: code });

    if (!verifyTherapist) {
      //res.status(404);
      // throw new Error('User not found');
      res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    } else {
      verifyTherapist.isVerified = true;
      await verifyTherapist.save();
      res.redirect("link on vercel/login"); //remember we are to replace this our own link same thing line 55
    }
  } catch (error) {
    res.status(500);
  }
});

/**
 * @desc Login a therapist
 * @route POST
 * @route /api/therapist/login
 * @access Public
 */
const loginTherapist = asyncHandler(async (req, res) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    res.status(400).json({
      success: false,
      message: validationError.array()[0].msg,
    });
  }
  const { email, password } = req.body;

  // Check for user
  const therapist = await Therapist.findOne({ email }).select("+password");

  if (!therapist) {
    res.status(404).json({
      success: false,
      message: "Therapist not found",
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

  if (therapist.isVerified === false) {
    res.status(422).json({
      success: false,
      message: "Your account is not verified",
    });
  }

  res.status(200).json({
    success: true,
    token: generateToken(user.id),
  });
});

/**
 * @desc Get Therapist Profile
 * @route GET
 * @route /api/therapist/profile
 * @access Private/Therapist
 */
const getTherapistProfile = asyncHandler(async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.user.id);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    return res.status(200).json({
      success: true,
      therapist,
    });
  } catch (error) {
    return res.status(500);
  }
});


/**
 * @desc Update Therapist Profile
 * @route PUT
 * @route /api/therapist/profile
 * @access Private/Therapist
 */
const updateTherapistProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, bio,  } = req.body;

  try {
    const therapist = await Therapist.findById(req.user._id);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found",
      });
    }

    therapist.firstName = firstName || therapist.firstName;
    therapist.lastName = lastName || therapist.lastName;
    therapist.bio = bio || therapist.bio;

    // // Only update the CV if a new file is uploaded
    // if (req.file) {
    //   therapist.cv = req.file.buffer;
    // }

    const updatedTherapist = await therapist.save();

    return res.json({
      success: true,
      _id: updatedTherapist._id,
      firstName: updatedTherapist.firstName,
      lastName: updatedTherapist.lastName,
      bio: updatedTherapist.bio,
    });
  } catch (error) {
    return res.status(400).json({
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
  const therapist = await Therapist.findOne({ email: req.body.email });

  if (!therapist) {
    // res.status(404);
    // throw new Error('There is no user with that email');
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Get reset token
  const resetToken = therapist.getResetPasswordToken();

  await therapist.save({ validateBeforeSave: false });

  // create message to pass
  const text = `<h1>Password Reset Link</h1>
        <h2>Hello ${therapist.firstName}</h2>
        <p>You are receiving this email because you (or someone else) has
         requested the reset of a password</p>
          <a href='https://mymentio-backend.onrender.com/api/user/resetpassword/${resetToken}'> Click here to reset your password</a> 

        </div>`;

  try {
    await sendEmail({
      email: therapist.email,
      subject: "Password reset token",
      message: text,
    });

    res.status(200).json({
      success: true,
      message: "Email sent",
      resetToken,
    });
  } catch (error) {
    therapist.resetPasswordToken = undefined;
    therapist.resetPasswordExpire = undefined;

    await therapist.save({ validateBeforeSave: false });

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

  const therapist = await Therapist.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!therapist) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // ?set new password
  therapist.password = req.body.password;
  therapist.resetPasswordToken = undefined;
  therapist.resetPasswordExpire = undefined;

  await therapist.save();

  return res.status(200).json({
    success: true,
    message: "Password Reset Successfully. Please Login with your new password",
  });
});

module.exports = {
  registerTherapist,
  getTherapistProfile,
  loginTherapist,
  updateTherapistProfile,
  verifyAccount,
  forgotPassword,
  resetPassword
};
