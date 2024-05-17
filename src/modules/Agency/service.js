const agencyModel = require("./model");
const User = require("../User/model");
const Host = require("../Host/model");
const { NotFound, BadRequest } = require("../../utility/errors");
const { asyncHandler } = require("../../utility/common");
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken');

const registerAgencyService = async (userId, agencyData, files) => {
  try {
    const existingAgency = await agencyModel.findOne({ userId });
    if (existingAgency) {
      return { status: 501, message: "User already has an agency" };
    }

    // Generate agencyId in the backend
    const agencyId = generateAgencyId(); // Implement generateAgencyId function

    // Add agencyId to the agencyData
    agencyData.agencyId = agencyId;
    agencyData.userId = userId; // Add userId to the agencyData

    if (files && files["nidPhotoFront"] && files["nidPhotoBack"]) {
      agencyData.nidPhotos = [
        {
          type: "front",
          url: files["nidPhotoFront"][0].buffer.toString("base64"),
        },
        {
          type: "back",
          url: files["nidPhotoBack"][0].buffer.toString("base64"),
        },
      ];
    } else {
      return { status: 400, message: "NID photos are required" };
    }

    // Create a new agency instance
    const newAgency = new agencyModel(agencyData);
    await newAgency.save();

    return {
      status: 201,
      message: "Agency registered successfully",
      agency: newAgency,
    };
  } catch (error) {
    console.error("Error registering agency:", error);
    return { status: 500, message: "Internal server error" };
  }
};
const generateAgencyId = () => {
  const timestamp = new Date().getTime();
  const randomNumber = Math.floor(Math.random() * 1000000);
  const agencyId = `AGY${timestamp}${randomNumber}`;
  return agencyId;
};

const getPendingHostService = async (role) => {
  try {
    // Assuming req.user.role contains the role of the user making the request
    if (!["AG", "AD"].includes(role)) {
      return { message: "role must be a authorized role" };
    }

    const pendingHosts = await User.find({ hostStatus: "Pending" });

    // Check if there are any pending hosts
    if (pendingHosts.length === 0) {
      return { message: "No pending hosts found" }; // Return a message if no pending hosts found
    }
    return pendingHosts;
  } catch (error) {
    console.error("Error saving pending hosts:", error);
    throw new Error("Internal server error");
  }
};

const approveHostService = async (userId, role) => {
  if (!["AG", "AD"].includes(role)) {
    throw new Error("Your role must be Agency owner or Admin");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Couldn't find user");
  }

  if (
    !user.hostId ||
    user.hostStatus !== "pending" ||
    !user.isActive ||
    !user.isVerified
  ) {
    throw new Error("User is not eligible for approval");
  }

  const agency = await agencyModel.findOne({ agencyId: user.agencyId });
  if (!agency) {
    throw new Error("Couldn't find agencyID");
  }

  // Approval of host begins with host status changing, also hostactivity to true
  user.hostStatus = "active";

  const host = new Host({
    userId: user._id,
    firebaseUid: user.firebaseUid,
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.userName,
    birthdate: user.birthdate,
    gender: user.gender,
    email: user.email,
    hostId: user.hostId,
    agencyId: user.agencyId,
    hostType: user.hostType,
    hostStatus: "active",
    nidFront: user.nidFront,
    nidBack: user.nidBack,
    agencyName: agency.agencyName,
    country: user.country,
    presentAddress: user.presentAddress,
    agencyEmail: agency.email,
    isActive: user.isActive,
    isApproved: true,//true after approval
    role: "HO",//role is getting changed from BU to Ho after approval
    isVerified: user.isVerified,
    refreshToken: user.refreshToken,
  });

  // Save the host document
  await host.save();

  // Return the host object
  return host;
};

// signinAgencyService.js
const signinAgencyService = async (email, password) => {
  try {
    // Find user by email
    const agency = await agencyModel.findOne({ email });
    
    // Check if user exists
    if (!agency) {
      throw new BadRequest("Invalid email or password.");
    }

    // Check if the agency is banned
    if (agency.agencyStatus === 'banned') {
      throw new BadRequest("This agency is banned and cannot sign in.");
    }

    // Validate password using bcrypt.compare
    const isMatch = await bcrypt.compare(password, agency.password);

    // Check password match
    if (!isMatch) {
      throw new BadRequest("Invalid email or password.");
    }

    // Generate JWT token with user data payload
    const accessToken = jwt.sign({ agency }, 'SecretKey12345', { expiresIn: '3d' });
    
    // Update isVerified field in the agency document
    await agencyModel.updateOne({ _id: agency._id }, { isVerified: true });

    // User is authenticated, return sanitized user data (excluding sensitive fields)
    const sanitizedUser = {
      accessToken,
      email: agency.email,
      phoneNumber: agency.phoneNumber,
      role: agency.role,
      isVerified: true,
    };

    return sanitizedUser;
  } catch (error) {
    console.error(error);
    throw error; 
  }
};





module.exports = {
  registerAgencyService,
  getPendingHostService,
  approveHostService,
  signinAgencyService
};
