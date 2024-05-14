const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: 'uploads/' });
const multerMiddleware = require('../../middlewares/multerMiddlware');
const { validate } = require("../../middlewares/schemaValidation"); // Corrected import

const {
  BASIC_USER, AGENCY_OWNER, MASTER_PORTAL,SUPER_ADMIN
}=require('../../config/constants');


const authService = require("./service");
const { adminValidate } = require("./request");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const authMiddleware = require("../../middlewares/authMiddleware");
const { asyncHandler } = require("../../utility/common");

console.log("test push")


const registerUserHandler = asyncHandler(async (req, res) => {
  try {


    // Extract file paths from request object
    const profilePicturePath = req.files['profilePicture'] ? req.files['profilePicture'][0].path : '';

    // Create user object with extracted file paths
    const userData = {
      ...req.body,
      profilePicture: profilePicturePath,
    };

    // Call the service function to handle user registration
    const result = await authService.registerUserService(userData);

    // Send response based on the result
    res.status(result.status).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Verify OTP

const otpVerifyHandler = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const verify = await authService.verifyOTPService(email, otp);

  res.json({
    message: "OTP verified successfully. User activated.",
    verify,
  });
});

//Resend OTP

const resendOTPHandler = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const otpResend = await authService.resendOTP(email);
  res.status(200).json({
    otpResend,
  });
});

//Expire OTP
const expireOTP = async (req, res, next) => {
  try {
    await authService.expireOTP(req.body);

    res.status(200).json({
      message: "OTP expired",
    });
  } catch (err) {
    next(err, req, res);
  }
};

const userSignInHandler = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await authService.signinUserService(email, password);
    res.status(200).json({
      message: "User signed in successfully.",
      user,
    });
  } catch (error) {
    res.status(401).json({
      error: error.message,
    });
  }
};

router.post('/register', multerMiddleware.upload.fields([
  { name: 'profilePicture', maxCount: 1 }
]), registerUserHandler);
router.post("/otpVerification", otpVerifyHandler);
router.post("/otpResend", resendOTPHandler); //not tested in postman
router.post("/expireOTP", expireOTP); //not tested in postman
router.post("/signInUser", userSignInHandler);

module.exports = router;
