const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: 'uploads/' });
const multerMiddleware = require('../../middlewares/multerMiddlware');
const { validate } = require("../../middlewares/schemaValidation"); // Corrected import

const {
  BASIC_USER, AGENCY_OWNER, MASTER_PORTAL,SUPER_ADMIN
}=require('../../config/constants');

const AgoraAccessToken = require('agora-access-token'); // Import agora-access-token

// Other imports...

const authService = require("./service");
const { adminValidate } = require("./request");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const authMiddleware = require("../../middlewares/authMiddleware");
const { asyncHandler } = require("../../utility/common");


const { generateAgoraToken } = require('../../utility/agora'); // Import Agora utility




const generateAgoraTokens = async (req, res) => {
  const { channelName, uid } = req.body;

  try {
    // Validate input
    if (!channelName || typeof uid !== 'number') {
      return res.status(400).json({ message: 'Invalid input. Channel name and UID are required.' });
    }

    // Generate Agora token
    const token = generateAgoraToken(channelName, uid);

    // Return the token in the response
    res.status(200).json({ token });
  } catch (error) {
    console.error('Failed to generate Agora token:', error);
    res.status(500).json({ message: 'Failed to generate Agora token' });
  }
};





// const registerUserHandler = asyncHandler(async (req, res) => {
 
//     const profilePicturePath = req.files['profilePicture'] ? req.files['profilePicture'][0].path : '';

//     const userData = {
//       ...req.body,
//       profilePicture: profilePicturePath,
//     };
//     const result = await authService.registerUserService(userData);

//     // Send response based on the result
//     res.status(200).json({
//       message:"User Create SuccessFully",
//       result
//     });
 
// });


const registerUserHandler = asyncHandler(async (req, res) => {
  const profilePicturePath = req.files['profilePicture'] ? req.files['profilePicture'][0].path : '';

  const userData = {
    ...req.body,
    profilePicture: profilePicturePath,
  };

  const result = await authService.registerUserService(userData);

  // Send response based on the result
  res.status(result.status).json(result);
});







// MasterPortalRegister 





const registerMasterPortalHandler =asyncHandler(async(req,res)=>{


    const {  email, password } = req.body;

    // Validate input
    if (!email || !password ) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Register user
    const user = await authService.registerMasterPortalUser({
      email,
      password,
   
    });

    return res.status(201).json({ message: 'User registered successfully', user });
 

})





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
router.post("/otpResend", resendOTPHandler); 
router.post("/expireOTP", expireOTP); 
router.post("/signInUser", userSignInHandler);

router.post('/registerMaster',registerMasterPortalHandler)
router.post('/agora-token',generateAgoraTokens);

module.exports = router;
