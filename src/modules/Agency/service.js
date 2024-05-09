const agencyModel = require("./model");
const User = require("../User/model");
const Host = require("../Host/model");
const { NotFound, BadRequest } = require("../../utility/errors");

const registerAgencyService = async (agencyData) => {
  try {
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
    return {message:"your role must be Agency owner or Admin"}; // Return null to indicate unauthorized access
  }

  // Find user from the userid
  const user = await User.findById(userId);
  if (!user) {
    return {message:"couldnt find user"};  // Return null to indicate user not found
  }

  // Check if the user even applied for host or not
  if (!user.hostId || user.hostStatus !== "Pending" || !user.isActive || !user.isVerified) {
    return {message:"Already a host"}; ; // Return null to indicate user not eligible for approval
  }

  // Check if the agencyID is in agency model
  const agency = await agencyModel.findById(user.agencyId);
  if (!agency) {
    return {message:"Couldnt find agencyID"};  // Return null to indicate agency not found
  }

  // Approval of host begins with host status changing, also hostactivity to true
  user.hostStatus = "Accepted";
  user.hostActivity = true;

  // Populating the host model from usermodel with that user info
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
    hostNid: user.hostNid,
    agencyName: user.agencyName,
    country: user.country,
    presentAddress: user.presentAddress,
    agencyEmail: user.agencyEmail,
    isActive: user.isActive,
    hostActivity: user.hostActivity,
    isApproved: true,
    role: user.role,
    isVerified: user.isVerified,
    refreshToken: user.refreshToken,
  });

  await host.save();

  return host;
};

module.exports = {
  registerAgencyService,
  getPendingHostService,
  approveHostService
};
