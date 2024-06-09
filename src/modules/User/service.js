const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./model");
const Agency = require('../Agency/model')
const Host = require('../Host/model')
const { NotFound, BadRequest } = require("../../utility/errors");
const firebase = require("../../utility/firebaseConfig");
const { generateOTP, generateHostId } = require("../../utility/common");
const admin = require("firebase-admin");




const resetPassword = async (email, newPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const update = { password: hashedPassword };

    console.log("Updating password for email:", email);
    const user = await User.findOneAndUpdate({ email: email }, update, {
      new: true,
    });
    console.log("Updated user:", user);

    if (!user) {
      throw new BadRequest("User not found with this email");
    }
    return user;
  } catch (error) {
    throw new Error("Failed to reset password.", error);
  }
};




//getAllUser

const getSocialUserById = async (firebaseUid) => {
  try {
    const user = await User.findOne({ firebaseUid: firebaseUid });
    return user;
  } catch (error) {
    console.error('Error finding user by Firebase UID:', error);
    throw new Error('Database query failed');
  }
};



const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

const getAllUserService = async (reQuerry, res) => {
  try {
    const { page = 1, limit = 10 } = reQuerry; // Default values for page and limit

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw new BadRequest(
        "Invalid page or limit parameters. Both must be positive integers."
      );
    }

    const skip = (page - 1) * limit; 

    const [users, totalUsersCount] = await Promise.all([
      User.find() // Select specific fields if desired
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    if (!users.length) {
      return res.status(204).json({ message: "No users found" });
    }

    const totalPages = Math.ceil(totalUsersCount / limit); // Calculate total pages

    return {
      users,
      pagination: {
        page,
        limit,
        totalPages,
        totalCount: totalUsersCount,
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};



const updateUserInfoService = async (
  userId,
  updatedInfo,
  profilePicturePath
) => {
  try {
    // Handle profile picture upload (if applicable):
    if (profilePicturePath) {
      // Update `updatedInfo` object to include profile picture path
      updatedInfo.profilePicture = profilePicturePath;
    }

    const updatedResult = await User.findByIdAndUpdate(userId, updatedInfo, {
      new: true,
    });

    if (!updatedResult) {
      throw new Error("User info to update not found");
    }

    return updatedResult;
  } catch (error) {
    throw error; // Re-throw error for proper handling in controller
  }
};

const applyToBeHostService = async (agencyId, hostType, userId, role) => {
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

const deleteUserById = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};




const banUser = async (masterPortalId, userId) => {
  try {
    // Verify the master portal user
    const masterPortal = await User.findById(masterPortalId);
    if (!masterPortal || masterPortal.role !== 'MP') {
      return { status: 400, message: 'Master Portal not found or not authorized' };
    }

    // Attempt to find and ban the user in the User model
    const user = await User.findById(userId);
    if (user) {
      user.isActive = false;
      user.hostStatus = 'banned';
      await user.save();
      return { status: 200, message: 'User banned successfully', user };
    }

    // Attempt to find and ban the user in the Agency model
    const agency = await Agency.findById(userId);
    if (agency) {
      agency.isActive = false;
      agency.agencyStatus = 'banned';
      await agency.save();
      return { status: 200, message: 'Agency banned successfully', agency };
    }

    return { status: 404, message: 'User or agency not found' };
  } catch (error) {
    console.error('Error banning user:', error);
    return { status: 500, message: 'Internal server error' };
  }
};








module.exports = {
  resetPassword,
  getSocialUserById,
  getAllUserService,
  updateUserInfoService,
  applyToBeHostService,
  getUserById,
  deleteUserById,
  banUser,
};
