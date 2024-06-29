const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./model");
const Agency = require('../Agency/model')
const Host = require('../Host/model')
const { NotFound, BadRequest } = require("../../utility/errors");
const firebase = require("../../utility/firebaseConfig");
const { generateOTP, generateHostId } = require("../../utility/common");
const admin = require("firebase-admin");
const Level = require("../Level/model");




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
    user.filterExpiredSkins();
    return user;
  } catch (error) {
    console.error('Error finding user by Firebase UID:', error);
    throw new Error('Database query failed');
  }
};



const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId).populate('skins');
    if (!user) {
      throw new Error("User not found");
    }

    user.filterExpiredSkins();
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};



const getAllUserService = async (reQuerry, res) => {
  try {


    // Fetch users from User model
    const [usersFromUserModel, usersFromAgencyModel, usersFromHostModel] = await Promise.all([
      User.find(),
      Agency.find(),
      Host.find()
    ]);

    // Combine users from both models
    const users = [...usersFromUserModel, ...usersFromAgencyModel, ...usersFromHostModel];

    if (!users.length) {
      return res.status(204).json({ message: "No users found" });
    }

    return {
      users,

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
      updatedInfo.profilePicture = profilePicturePath
      
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
    if (!masterPortal || masterPortal.role !== 'MP' && masterPortal.role !== 'AD') {
      return { status: 400, message: 'Master Portal not found or not authorized' };
    }
    console.log(masterPortal)
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
    // Attempt to find and ban the user in the Host model
    const host = await Host.findById(userId);
    if (host) {
      host.isActive = false;
      host.hostStatus = 'banned';
      await host.save();
      return { status: 200, message: 'Host banned successfully', host };
    }

    return { status: 404, message: 'User or agency not found' };
  } catch (error) {
    console.error('Error banning user:', error);
    return { status: 500, message: 'Internal server error' };
  }
};



// getALL Banned Users

const getALLBannedUsers = async () => {

  const bannedUsers = User.find({ hostStatus: 'banned' });
  if (!bannedUsers) {
    throw new BadRequest("User not found")
  }
  return bannedUsers;

}


// how many users created current day

const getAccountsCreatedToday = async () => {

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const accountsToday = await User.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  if (!accountsToday) {
    throw new BadRequest("No accounts were created")
  }
  return accountsToday.length;

};




const unBanUser = async (masterPortalId, userId) => {
  try {
    // Verify the master portal user
    const masterPortal = await User.findById(masterPortalId);
    if (!masterPortal || masterPortal.role !== 'MP' && masterPortal.role !== 'AD') {
      return { status: 400, message: 'Master Portal not found or not authorized' };
    }

    // Attempt to find and ban the user in the User model
    const user = await User.findById(userId);
    if (user) {
      user.isActive = false;
      user.hostStatus = 'unbanned';
      await user.save();
      return { status: 200, message: 'User unbanned successfully', user };
    }

    // Attempt to find and ban the user in the Agency model
    const agency = await Agency.findById(userId);
    if (agency) {
      agency.isActive = false;
      agency.agencyStatus = 'unbanned';
      await agency.save();
      return { status: 200, message: 'Agency unbanned successfully', agency };
    }
    // Attempt to find and ban the user in the Host model
    const host = await Host.findById(userId);
    if (host) {
      host.isActive = false;
      host.hostStatus = 'unbanned';
      await host.save();
      return { status: 200, message: 'Host unbanned successfully', host };
    }
    return { status: 404, message: 'User or agency not found' };
  } catch (error) {
    console.error('Error banning user:', error);
    return { status: 500, message: 'Internal server error' };
  }
};
const getUserLevelService = async (diamonds, role) => {
  try {
    const level = await Level.findOne({ diamonds: { $lte: diamonds } }).sort({ diamonds: -1 }).exec();
    if(!level) {
      return { status: 200, message: 'User level get successfull', level: {levelName: '0', diamonds: 0} };
    }
    return { status: 200, message: 'User level get successfull', level: {levelName: level.levelName, diamonds: level.diamonds} };
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
  getALLBannedUsers,
  getAccountsCreatedToday,
  unBanUser,
  getUserLevelService

};



