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
const Agency = require("../Agency/model");
const { mongo, default: mongoose } = require("mongoose");
const { DateModule } = require("@faker-js/faker");
const multerMiddleware = require('../../middlewares/multerMiddlware');


const resetPasswordHandler = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  const response = await userService.resetPassword(email, newPassword);
  res.status(200).json({
    message: "Successfully reset password",
    response,
  });
});

const getUserProfileBySocialId = asyncHandler(async (req, res) => {
  const firebaseUid = req.params.firebaseUId;
  
    const user = await userService.getSocialUserById(firebaseUid);
    res.status(200).json({
      message:"Successfully Fetched all users!",
      user
    })
  
});



const getUserById = asyncHandler(async(req,res)=>{
  const userId = req.params.userId;
  try {
    const user = await userService.getUserById(userId);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

const getAllUsersHandler = asyncHandler(async (req, res) => {
  const users = await userService.getAllUserService(req.query);
  res.status(200).json({ users });
});

const updateUserInfoHandler = asyncHandler(async (req, res) => {
  const profilePicturePath = req.files['profilePicture'] ? req.files['profilePicture'][0].path : '';
  const updatedUser = await userService.updateUserInfoService(
    req.params.id,
    req.body,
    profilePicturePath
  );
  res.status(200).json({
    updatedUser,
  });
});



const deleteUserByIdHandler = asyncHandler(async(req,res)=>{
  const userId = req.params.userId;
  const user = await userService.deleteUserById(userId);
  if(!user){
    return res.status(404).json({message:"User not found"});
  }
  res.status(200).json({message:"User deleted successfully",result:user});
})

router.get("/getAllUser", getAllUsersHandler);
router.get("/firebaseUsersById/:firebaseUId", getUserProfileBySocialId);
router.get('/getUserById/:userId',getUserById)
router.put("/updateUserInfo/:id",  multerMiddleware.upload.fields([
  { name: 'profilePicture', maxCount: 1 }
]),updateUserInfoHandler);

router.post("/resetPass", resetPasswordHandler); //not tested in postman
router.delete("/deleteUserById/:userId",deleteUserByIdHandler);

module.exports = router;
