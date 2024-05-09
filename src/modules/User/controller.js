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

const resetPasswordHandler = asyncHandler(async (req, res) => {
  const { email, newPassword } = req.body;

  const response = await userService.resetPassword(email, newPassword);
  res.status(200).json({
    message: "Successfully reset password",
    response,
  });
});

const getUserProfileBySocialId = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await userService.getSocialUserById(userId);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  const users = await userService.getAllUserService();
  res.status(200).json({ users });
});

const updateUserInfoHandler = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateUserInfoService(
    req.params.id,
    req.body
  );
  res.status(200).json({
    updatedUser,
  });
});

// const updateSocialUser = asyncHandler(async (req, res) => {
//   //need to work on this
//   try {
//     const userId = req.params.userId; // Assuming userId is passed in the request parameters
//     const user = await userService.getSocialUserById(userId); // Fetch the user from the service
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Additional information to update the user
//     const additionalInfo = {
//       // Add the additional fields you want to update
//       // For example:

//       role: req.body.role,
//       hostStatus: req.body.hostStatus,
//       agencyId: req.params.agencyId,
//       hostId: req.params.hostId,

//       // Add more fields as needed
//     };

//     // Update the user in Firebase
//     await userService.updateUser(userId, additionalInfo);
//     const updatedUser = await userService.getSocialUserById(userId);
//     res
//       .status(200)
//       .json({ message: "User updated successfully", result: updatedUser });
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });


const deleteUserByIdHandler = asyncHandler(async(req,res)=>{
  const userId = req.params.userId;
  const user = await userService.deleteUserById(userId);
  if(!user){
    return res.status(404).json({message:"User not found"});
  }
  res.status(200).json({message:"User deleted successfully",result:user});
})

router.get("/getAllUser", getAllUsersHandler);
router.get("/firebaseUsersById/:userId", getUserProfileBySocialId);
router.get('/getUserById/:userId',getUserById)
router.put("/updateUserInfo/:id", updateUserInfoHandler);

router.post("/resetPass", resetPasswordHandler); //not tested in postman
// router.put("/updateSocialUser/:userId/:agencyId/:hostId", updateSocialUser);
router.delete("/deleteUserById/:userId",deleteUserByIdHandler);

module.exports = router;
