const jwt = require("jsonwebtoken");
const saltRounds = 10;
const User = require("../User/model");
const agencyModel = require("../Agency/model");
const {
  BadRequest,
  Unauthorized,
  Forbidden,
  NoContent,
} = require("../../utility/errors");

const { generateOTP } = require("../../utility/common");
const nodemailer = require("nodemailer");
const {SendEmailUtility} = require('../../utility/email');

const createToken = require("../../utility/createToken");
const bcrypt = require("bcryptjs");
const { decrypt } = require("dotenv");
const { IosApp } = require("firebase-admin/project-management");





const approveAgency = async (password, email, adminId) => {
  try {
    // Find the agency by email
    const agency = await agencyModel.findOne({ email });

    if (!agency) {
      throw new Error("Agency not found");
    }

    // Check the agency status
    if (agency.agencyStatus === "banned") {
      throw new Error("Agency is banned and cannot be approved");
    }
    if (agency.agencyStatus === "active") {
      throw new Error("Agency is already approved");
    }
    if (agency.agencyStatus !== "pending") {
      throw new Error("Agency is not in a state that can be approved");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update the agency fields
    agency.agencyStatus = "active";
    agency.isApproved = true;
    agency.isActive = true;
    agency.password = hashedPassword;
    agency.approvedBy = adminId;

    // Save the updated agency
    await agency.save();

    // Send the password email
    await SendEmailUtility(email, password);
    
    return { success: true, data: agency };
  } catch (error) {
    console.error('Error in approveAgency service:', error);
    throw new Error(`Approve Agency Error: ${error.message}`);
  }
};





const removeAgencyService = async (agencyId) => {
  try {
    await agencyModel.findByIdAndDelete(agencyId);
    return { success: true, message: "Agency removed successfully." };
  } catch (error) {
    console.error("Error removing agency:", error);
    return {
      success: false,
      message: "An error occurred while removing the agency.",
    };
  }
};






const banAgencyService = async (id) => {
  try {
    const agency = await agencyModel.findById({_id:id});

    if (!agency) {
      return { success: false, message: "Agency not found." };
    }

    agency.agencyStatus = "banned";
    agency.isActive = false;
    agency.isVerified = false;
    agency.isApproved=false;
    await agency.save();
    return { success: true, message: "Agency banned successfully." ,data : agency};
  } catch (error) {
    console.error("Error banning agency:", error);
    return {
      success: false,
      message: "An error occurred while banning the agency.",
    };
  }
};




const disableAgencyService = async (id) => {
  try {
    const agency = await agencyModel.findById({_id:id});

    if (!agency) {
      return { success: false, message: "Agency not found." };
    }

    agency.isActive = false;
    agency.isVerified=false;
    await agency.save();
    return { success: true, message: "Agency disabled successfully." };
  } catch (error) {
    console.error("Error disabling agency:", error);
    return {
      success: false,
      message: "An error occurred while disabling the agency.",
    };
  }
};






const grantMaxPowerService = async (agencyId) => {
  try {
    const agency = await agencyModel.findById(agencyId);

    if (!agency) {
      return { success: false, message: "Agency not found." };
    }

    agency.maxPower = true;
    await agency.save();
    return { success: true, message: "Max power granted successfully." };
  } catch (error) {
    console.error("Error granting max power:", error);
    return {
      success: false,
      message: "An error occurred while granting max power.",
    };
  }
};


const makeAdminService = async (agencyId) => {
  try {
    const agency = await agencyModel.findById(agencyId);

    if (!agency) {
      return { success: false, message: "Agency not found." };
    }

    agency.role = "AD";
    await agency.save();
    return { success: true, message: "Agency made admin successfully." };
  } catch (error) {
    console.error("Error making agency admin:", error);
    return {
      success: false,
      message: "An error occurred while making the agency admin.",
    };
  }
};



const transferAgencyService = async (AgencyId, newAgencyId) => {
  try {
    const agency = await agencyModel.findById({_id:AgencyId});

    if (!agency) {
      return { success: false, message: "Agency not found." };
    }

    agency.agencyId = newAgencyId;
    await agency.save();
    return { success: true, message: "Agency transferred successfully." };
  } catch (error) {
    console.error("Error transferring agency:", error);
    return {
      success: false,
      message: "An error occurred while transferring the agency.",
    };
  }
};



const getAllAgencies = async () => {
  try {
    // const agencies = await User.find({ role: "AG" });
    const agencies = await agencyModel.find();
    return agencies;
  } catch (error) {
    throw new Error(error.message);
  }
};


// all User Manage
const registerUserService = async (userData) => {
  try {
    const { email, password, ...rest } = userData;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user with additional fields set to true
    const newUser = new User({
      email,
      password,
      ...rest,
      isVerified: true,
      isApproved: true,
      isActive: true,
    });

    await newUser.save();

    return newUser;
  } catch (error) {
    throw new Error(error.message);
  }
};



// ALL Users Sign In


const signInService = async (email, password) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if the password is correct
    const isMatch = await user.authenticate(password);
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      "SecretKey12345",
      { expiresIn: '1h' }
    );

    return { user, token };
  } catch (error) {
    throw new Error(`Sign-in failed: ${error.message}`);
  }
};








// get ALL Admin


const getAllAdminService = async () => {
  try {
    const agencies = await User.find({ role: "AD" });
  
    return agencies;
  } catch (error) {
    throw new Error(error.message);
  }
};



// how many Host Approved todays
const getApprovedHostsToday = async () => {
  try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const approvedHostsToday = await User.find({
          isApproved: true,
          role: "HO",
          updatedAt: { $gte: startOfDay, $lte: endOfDay }
      });

      return approvedHostsToday;
  } catch (error) {
      console.error("Error fetching approved hosts today:", error);
      throw new Error('Internal server error');
  }
};





const resetPasswordForRoles = async (userId, role) => {
  const newPassword = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  let user;

  if (role === 'AG') {
    user = await agencyModel.findById(userId);
    if (!user) {
      throw new Error('Agency not found');
    }
    user.password = hashedPassword;
    await user.save();
    await SendEmailUtility(user.email, `Your new password is: ${newPassword}`, 'Password Reset Notification');
  } else {
    user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.password = hashedPassword;
    await user.save();
    await SendEmailUtility(user.email, `Your new password is: ${newPassword}`, 'Password Reset Notification');
  }

  return user;
};




const getPasswordResetRequestsService = async () => {
  try {
    const users = await User.find({ passwordResetRequested: true });
    const count = users.length;
    return { count, users };
  } catch (error) {
    console.error('Error fetching password reset requests:', error);
    throw error;
  }
};







// enabale agency

const enableAgency = async (agencyId) => {
  try {
    // Find the agency by its ID and update the `isActive` field to true
    const agency = await agencyModel.findByIdAndUpdate(
      agencyId,
      { isActive: true, 
        agencyStatus: 'enabled',
        isVerified:true,
        isApproved:true

       },
      { new: true }
    );

    if (!agency) {
      throw new Error('Agency not found');
    }

    return { status: 200, message: 'Agency enabled successfully', agency };
  } catch (error) {
    console.error(`Failed to enable agency: ${error.message}`);
    throw new Error(`Failed to enable agency: ${error.message}`);
  }
};





module.exports = {
  approveAgency,
  removeAgencyService,
  banAgencyService,
  disableAgencyService,
  grantMaxPowerService,
  makeAdminService,
  transferAgencyService,
  getAllAgencies,
  registerUserService,
  getAllAdminService,
  signInService,
  getApprovedHostsToday,
  resetPasswordForRoles,
  enableAgency,
  getPasswordResetRequestsService
};
