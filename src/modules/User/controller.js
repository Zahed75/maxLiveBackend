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

const updateUserInfoHandler = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateUserInfoService(
    req.params.id,
    req.body
  );
  res.status(200).json({
    updatedUser,
  });
});

const applyToBeHostHandler = asyncHandler(async (req, res) => {
  const agencyId = req.body.agencyId;
  const hostType = req.body.hostType;
  const userId = req.params.userId;
  const hostId = await userService.applyToBeHostService(
    agencyId,
    hostType,
    userId
  );
  if (!hostId) {
    res.status(401).json({ message: "Unauthorized to be a host" });
  }
  res.status(201).json({ message: "successful", hostId });
});


router.get("/getAllUser", getAllUsersHandler);
router.put("/updateUserInfo/:id", updateUserInfoHandler);
router.get("/usersById/:userId", getUserProfileById);
router.post("/applytoBeHost/:userId", applyToBeHostHandler);
router.post("/resetPass", resetPasswordHandler);//not tested in postman

module.exports = router;
