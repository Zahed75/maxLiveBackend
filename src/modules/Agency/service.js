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











// const passwordResetService = async (adminId, userId, newPassword) => {
//   // Fetch the admin and user from the database
//   const admin = await User.findById(adminId);
//   const user = await User.findById(userId);

//   if (!admin || !user) {
//     throw new Error("Admin or user not found");
//   }

//   // Check if the admin has the correct role
//   if (admin.role !== "MP" && admin.role !== "AD") {
//     throw new Error("You do not have permission to reset passwords");
//   }

//   // Check if the user is one of the allowed roles
//   // Check if the user is one of the allowed roles
//   const allowedRoles = ["BU", "HO", "AD", "AG", "BR"];
//   if (!allowedRoles.includes(user.role)) {
//     // If user role is not found, check in Agency model
//     const agencyUser = await Agency.findOne({ userId: user._id });
//     if (!agencyUser || !allowedRoles.includes(agencyUser.role)) {
//       throw new Error("You can only reset passwords for specific roles");
//     }
//     user = agencyUser;
//   }

//   // Hash the new password
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(newPassword, salt);

//   // Update the user's password
//   user.password = hashedPassword;
//   await user.save();

//   return user;
// }




const passwordResetService = async (adminId, userId, newPassword) => {
  // Fetch the admin and user from the database
  const admin = await User.findById(adminId);
  const user = await User.findById(userId);

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

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update the user's password or agency's password based on the role
  if (user.role === "AG") {
    const agency = await agencyModel.findOne({ userId: user._id });
    if (!agency) {
      throw new Error("Agency not found for the user");
    }
    agency.password = hashedPassword;
    await agency.save();
  } else {
    user.password = hashedPassword;
    await user.save();
  }

  return user;
}








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


};
