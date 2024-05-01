const express = require("express");
const router = express.Router();
const firebase = require("../../utility/maxlive-c8947-firebase-adminsdk-cnvfh-9e931f15cc.json");
const userService = require("../User/service");

const {
  brandManagerValidate,
  changeUserDetailsValidate,
  changePasswordValidate,
} = require("./request");

const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const handleValidation = require("../../middlewares/schemaValidation");
const { asyncHandler } = require("../../utility/common");
const { HEAD_OFFICE, BRANCH_ADMIN } = require("../../config/constants");
const { app } = require("firebase-admin");


const registerUserHandler = asyncHandler(async(req,res)=>{
const userInfo = await userService.userRegisterService(req.body);
res.status(200).json({message:"user created successfully",userInfo});
})







const resetPasswordHandler = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  const response = await userService.resetPassword(email, newPassword);
  res.status(200).json({
    message: "Successfully reset password",
    response,
  });
});

const getUserProfileById = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await userService.getUserById(userId);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const getAllUsersHandler = asyncHandler(async (req, res) => {
  const users = await userService.getAllUserService();
  res.status(200).json({ users });
});

const saveUserHandler = asyncHandler(async (req, res) => {
  const user = await userService.saveUserService(req.body);
  res.status(200).json({
    message: "User added successfully!",
    user,
  });
});

const updateUserInfoHandler = asyncHandler(async(req, res) => {

  const updatedUser=await userService.updateUserInfoService(req.params.id,req.body);
  res.status(200).json({
      updatedUser
  })
});

const signInHandler = asyncHandler(async(req, res)=>{
  const { email } = req.body;

  try {
    await userService.generateAndSendOTPService(email);
    res.status(200).json({ message: 'OTP sent to email for sign-in' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
})
const otpVerifyHandler = asyncHandler(async(req,res)=>{
  const { email, otp } = req.body;
  const verify=await userService.verifyOTPService(email,otp)
  
    res.json({
       message: 'OTP verified successfully. User activated.',
       verify
      });
});



const applyToBeHostHandler = asyncHandler(async(req,res)=>{

  const agencyId = req.params.agencyId;
  const hostType = req.body;
  console.log(req.user)
  const hostId = await userService.applyToBeHostService(agencyId,hostType,req.user);
  if(!hostId){
    res.status(401).json({message:"Unauthorized to be a host"})
  }
  res.status(201).json({message:"successful",hostId})
  console.log(req.user);

})

router.post("/otpVerifyHandler",otpVerifyHandler)
router.post("/signInHandler",signInHandler)
router.post("/registerUserHandler",registerUserHandler);
router.get("/getAllUser",getAllUsersHandler);
router.put("/updateUserInfo/:id",updateUserInfoHandler)
router.post("/resetPass", resetPasswordHandler);
router.get("/usersById/:userId", getUserProfileById);
router.get("/allUsers", getAllUsersHandler);
router.post("/saveUser", saveUserHandler);
router.post("/applytoBeHost",applyToBeHostHandler);


module.exports = router;
