const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./model");
const { NotFound, BadRequest } = require("../../utility/errors");
const firebase = require("../../utility/firebaseConfig");
const { generateOTP, generateHostId } = require("../../utility/common");
const admin = require("firebase-admin");

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
    throw new Error("Failed to reset password.", error);
  }
};

//getAllUser

const getSocialUserById = async (firebaseUid) => {
  try {
    const user = await User.findOne({ firebaseUid: firebaseUid });
    if (user) {
      return user;
    }
    return { message: "Could not find social user" };
  } catch (error) {
    console.log(error);
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

    const skip = (page - 1) * limit; // Calculate offset for pagination

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

module.exports = {
  resetPassword,
  getSocialUserById,
  getAllUserService,
  updateUserInfoService,
  applyToBeHostService,
  getUserById,
  deleteUserById,
};
