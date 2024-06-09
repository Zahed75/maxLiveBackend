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
const { BadRequest } = require("../../utility/errors");



const resetPasswordHandler = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  const response = await userService.resetPassword(email, newPassword);
  res.status(200).json({
    message: "Successfully reset password",
    response,
  });
});




const getUserProfileBySocialId = asyncHandler(async (req, res) => {
  const { firebaseUid } = req.params;

  try {
    const user = await userService.getSocialUserById(firebaseUid);
    if (!user) {
      return res.status(404).json({
        message: 'User Not Found',
      });
    }
    res.status(200).json({
      message: 'Successfully fetched the user!',
      user,
    });
  } catch (error) {
    console.error('Error fetching user by Firebase UID:', error);
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
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
    message:" User info updated successfully",
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





const banUserHandler = asyncHandler(async (req, res) => {
  const { masterPortalId, userId } = req.body;

  if (!masterPortalId || !userId) {
    return res.status(400).json({ message: 'Master portal ID and user ID are required' });
  }

  const result = await userService.banUser(masterPortalId, userId);

  res.status(200).json({
    message:"User has been banned",
    result
  });
});




// get User Details

// src/controllers/userController.js

const getUserDetails = async (req, res) => {
  try {
      const user = req.user; // User is already set by the middleware

      res.json({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          beans: user.beans,
          coins: user.coins,
          stars: user.stars,
          diamonds: user.diamonds,
          vipStatus: user.vipStatus,
          vipLevel: user.vipLevel,
          frames: user.frames,
          skins: user.skins,
          posts: user.posts,
          followers: user.followers,
          following: user.following,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
      });
  } catch (error) {
      console.log("Error in getUserDetails controller:", error);
      res.status(500).json({ message: 'Internal server error' });
  }
};








router.get("/getAllUser", getAllUsersHandler);
router.get("/firebaseUsersById/:firebaseUid", getUserProfileBySocialId);
router.get('/getUserById/:userId',getUserById)
router.put("/updateUserInfo/:id",  multerMiddleware.upload.fields([
  { name: 'profilePicture', maxCount: 1 }
]),updateUserInfoHandler);
router.post("/resetPass", resetPasswordHandler); //not tested in postman
router.delete("/deleteUserById/:userId",deleteUserByIdHandler);
router.post('/banUser',banUserHandler);

router.get('/getUserDetails',authMiddleware,getUserDetails)

module.exports = router;
