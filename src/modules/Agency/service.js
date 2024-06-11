const agencyModel = require("../Agency/model");
const User = require("../User/model");
const Host = require("../Host/model");
const { NotFound, BadRequest } = require("../../utility/errors");
const { asyncHandler } = require("../../utility/common");
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken');
const mongoose = require("mongoose");


const registerAgencyService = async (userId, agencyData, files) => {
  try {
    const existingAgency = await agencyModel.findOne({ userId });
    if (existingAgency) {
      return { status: 501, message: "User already has an agency" };
    }

    // Generate agencyId in the backend
    const agencyId = generateAgencyId(); // Implement generateAgencyId function

    // Add agencyId and userId to the agencyData
    agencyData.agencyId = agencyId;
    agencyData.userId = userId;

    // Check if NID photos are provided
    if (files && files["nidPhotoFront"] && files["nidPhotoBack"]) {
      agencyData.nidFront = files["nidPhotoFront"][0].path; // Save file path for front NID photo
      agencyData.nidBack = files["nidPhotoBack"][0].path;   // Save file path for back NID photo
    } else {
      return { status: 400, message: "NID photos are required" };
    }

    // Create a new agency instance
    const newAgency = new agencyModel(agencyData);
    await newAgency.save();

    // Update the user's role to 'AG'
    await User.findByIdAndUpdate(userId, { role: 'AG' });

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
    if (!["AG", "AD","MP"].includes(role)) {
      return { message: "role must be a authorized role" };
    }

    const pendingHosts = await User.find({ hostStatus: "pending" });

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
  await user.save();

  // Return the host object
  return host;
};



// signinAgencyService.js
const signinAgencyService = async (email, password) => {
  try {
    // Find user by email
    const agency = await agencyModel.findOne({ email });


    if (!agency) {
      throw new BadRequest("Invalid email or password.");
    }
    if (agency.agencyStatus === 'banned') {
      throw new BadRequest("This agency is banned and cannot sign in.");
    }


    const isMatch = await bcrypt.compare(password, agency.password);
    if (!isMatch) {
      throw new BadRequest("Invalid email or password.");
    }

    // Generate JWT token with minimal payload
    const payload = { id: agency._id, role: agency.role };
    // const accessToken = jwt.sign(payload, 'shrtKey123', { expiresIn: '10d' });
    const accessToken = jwt.sign({ payload }, 'SecretKey12345', { expiresIn: '3d' });

    // Update isVerified field in the agency document
    await agencyModel.updateOne({ _id: agency._id }, { isVerified: true });

    // User is authenticated, return sanitized user data (excluding sensitive fields)
    // console.log(agency);

    const sanitizedUser = {

    accessToken,
    email: agency.email,
    phoneNumber: agency.phoneNumber,
    role: agency.role,
    isVerified: true,
  
};
    
    return{agency,sanitizedUser}
  } catch (error) {
    console.error(error);
    throw error;
  }
};











// updateAgency

const updateAgencyById = async(id,value)=>{
  const agencyList= await agencyModel.findByIdAndUpdate({_id:id},value,{
    new:true,
  });

  if(!agencyList){
    throw new NotFound("Agency not found in this ID");
  }
  return agencyList;
}





// GetALL host By Agency ID

const getAllHostsByAgency = async (agencyId) => {
  
    // Fetch hosts associated with the agencyId
    const hosts = await Host.find({ agencyId }).populate('userId', 'firstName lastName email');

    if (!hosts.length) {
      throw new Error('No hosts found for this agency');
    }

    return hosts;
  
};


const detailsHostByUserId = async(id)=>{
  const hostInfo= await Host.findById({_id:id});
  if(!hostInfo){
    throw new NotFound("Host not found in this ID");

  }
  return hostInfo;

}



const passwordResetService = async (adminId, userId,id, newPassword) => {
  try {
    // Fetch the admin and user from the database
    const admin = await User.findById(adminId);
    let user;

    // Check if the user is an agency or a basic user
    if (admin && admin.role === "MP" || admin.role === "AD") {
      console.log(`adminId: ${adminId}, userId: ${userId}`)
      user = await User.findById(userId);
    } else {
      user = await agencyModel.findById({_id:id});
    }
    console.log(`adminId: ${adminId}, userId: ${userId}`);


    if (!admin || !user) {
      throw new Error("Admin or user not found");
    }

    // Check if the admin has the correct role
    if (admin.role !== "MP" && admin.role !== "AD") {
      throw new Error("You do not have permission to reset passwords");
    }

    // Check if the user is one of the allowed roles
    const allowedRoles = ["BU", "HO", "AD", "AG", "BR"];
    if (!allowedRoles.includes(user.role)) {
      throw new Error("You can only reset passwords for specific roles");
    }

    console.log(allowedRoles)

    // Set the new password (it will be hashed by the pre('save') middleware)
    user.password = newPassword;
    await user.save();

    return user;
  } catch (error) {
    throw new Error(`Failed to reset password: ${error.message}`);
  }
};













// declained Host


const blockHostService = async (adminId, id) => {
  console.log(`Admin ID: ${adminId}`);
  console.log(`Host ID: ${id}`);

  try {
    const admin = await User.findById(adminId);
    if (!admin) {
      throw new Error("Admin not found");
    }

    // Convert hostId to ObjectId
    const host = await Host.findOne({ _id:id });
    if (!host) {
      throw new Error("Host not found");
    }

    host.isBlock = true;
    await host.save();

    return host;

  } catch (error) {
    console.error("Error in blockHostService:", error);
    throw error; // Rethrow the error to be caught in the controller
  }
};



// Update block host


const unblockHostService = async (adminId, id) => {
  const admin = await User.findById(adminId);
  if (!admin) {
    throw new Error("Admin not found!");
  }

  const host = await Host.findById(id);
  if (!host) {
    throw new Error("Host not found!");
  }

  host.isBlock = false;
  await host.save();

  return host;
};




const passwordResetAgency = async (adminId, userId, newPassword) => {
  try {
    // Fetch the admin from the database
    const admin = await User.findById(adminId);
    if (!admin) {
      throw new Error("Admin not found");
    }

    // Check if the admin has the correct role
    if (admin.role !== "MP" && admin.role !== "AD") {
      throw new Error("You do not have permission to reset passwords");
    }

    // Fetch the user or agency by ID
    let user = await User.findById(userId);
    if (!user) {
      user = await Agency.findById(userId);
    }

    if (!user) {
      throw new Error("User or Agency not found");
    }

    // Check if the user/agency is one of the allowed roles
    const userRole = user.role;
    if (!["AD", "AG"].includes(userRole)) {
      throw new Error("You can only reset passwords for Admin and Agency roles");
    }

    // Set the new password (it will be hashed by the pre('save') middleware)
    user.password = newPassword;
    await user.save();

    return user;
  } catch (error) {
    console.error(`Failed to reset password: ${error.message}`);
    throw new Error(`Failed to reset password: ${error.message}`);
  }
};







// get-Agency Details

const getAgencyById = async (id) => {

    const agency = await agencyModel.findById(id); 
    if(!agency){
      throw new BadRequest("Agency Not Found")
    }
    return agency; 
  
};


const transferHostToAgency = async (hostId, newAgencyId) => {
  try {
    // Find the host
    const host = await Host.findOne({ _id: hostId, role: 'HO' });
    if (!host) {
      throw new NotFound('Host not found');
    }

    // Check if the new agency exists
    const newAgency = await agencyModel.findById(newAgencyId);
    if (!newAgency) {
      throw new NotFound('New agency not found');
    }

    // Transfer the host to the new agency
    host.agencyId = newAgencyId;
    await host.save();

    return host;
  } catch (error) {
    console.error('Error transferring host to new agency:', error);
    throw error;
  }
};






module.exports = {
  registerAgencyService,
  getPendingHostService,
  approveHostService,
  signinAgencyService,
  updateAgencyById,
  getAllHostsByAgency,
  detailsHostByUserId,
  passwordResetService,
  blockHostService,
  unblockHostService,
  passwordResetAgency,
  getAgencyById,
  transferHostToAgency

};
