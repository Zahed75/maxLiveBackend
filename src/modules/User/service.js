const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./model");
const { NotFound, BadRequest } = require("../../utility/errors");
const firebase = require("../../utility/firebaseConfig");
const { generateOTP, generateHostId } = require("../../utility/common");


const resetPassword = async (email, newPassword) => {
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Construct the update object to set the new hashed password
    const update = { password: hashedPassword };

    console.log("Updating password for email:", email);

    // Find the user by email and update the password
    const user = await User.findOneAndUpdate({ email: email }, update, {
      new: true,
    });

    console.log("Updated user:", user);

    if (!user) {
      throw new BadRequest("User not found with this email");
    }

    return user;
  } catch (error) {
    throw new Error("Failed to reset password.");
  }
};

//getAllUser

const getSocialUserById = async (userId) => {
  try {
    const user = await firebase.getUserById(userId);
    return user;
  } catch (error) {
    console.log(error);
  }
};


const getAllUserService = async () => {
  const Users = await User.find();
  if (!Users) {
    throw new BadRequest("Could Not find Users");
  }
  return Users;
};

const updateUserInfoService = async (userId, updatedInfo) => {
  const updatedResult = await User.findByIdAndUpdate(userId, updatedInfo, {
    new: true,
  });
  if (!updatedResult) {
    throw new Error("User info to update not found");
  }

  return updatedResult;
};




const applyToBeHostService = async (agencyId, hostType, userId,role) => {
  try {

    const hostId = generateHostId();
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found"); // Throw an error if user is not found
    }
    user.agencyId = agencyId;
    user.hostType = hostType;
    user.hostId = hostId;
    user.role = role;
    await user.save();
    
    return hostId;
  } catch (error) {
    console.error("Error applying to be host:", error);
    throw error;
  }
};

module.exports = {
  resetPassword,
  getSocialUserById,
  getAllUserService,
  updateUserInfoService,
  applyToBeHostService,
};
