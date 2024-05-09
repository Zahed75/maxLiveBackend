const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./model");
const { NotFound, BadRequest } = require("../../utility/errors");
const firebase = require("../../utility/firebaseConfig");
const { generateOTP, generateHostId } = require("../../utility/common");
const admin = require('firebase-admin');


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
    throw new Error("Failed to reset password.",error);
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
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
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

const updateUser = async (userId, additionalInfo) => {
  ///need to work on this !!!!
  try {
    // Use Firebase Admin SDK to update the user
    const result = await admin.auth().updateUser(userId, additionalInfo);
    return result; // It's better to return the result for success cases as well
  } catch (error) {
    console.error("Error updating user in Firebase:", error);
    throw new Error("Error updating user in Firebase");
  }
};


const deleteUserById = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};


module.exports = {
  resetPassword,
  getSocialUserById,
  getAllUserService,
  updateUserInfoService,
  applyToBeHostService,
  updateUser,
  getUserById,
  deleteUserById
};
