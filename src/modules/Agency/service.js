const agencyModel = require("./model");
const User = require("../User/model");
const Host = require("../Host/model");
const { NotFound, BadRequest } = require("../../utility/errors");

const registerAgencyService = async (agencyData) => {
  try {
    const {
      agencyName,
      agencyHolderName,
      country,
      presentAddress,
      email,
      phone,
    } = agencyData;
    if (
      !agencyName ||
      !agencyHolderName ||
      !country ||
      !presentAddress ||
      !email ||
      !phone
    ) {
      return { status: 400, message: "All fields are required" };
    }

    // Create a new agency instance
    const newAgency = new agencyModel(agencyData);

    // Check if the super panel approved the agency
    // if (!newAgency.isApproved) {
    //     return { status: 401, message: "Agency registration pending approval from super admin" };
    // }
    // Assign the approvedBy field to the super panel's id
    // newAgency.approvedBy = admin._id;
    // Save the agency to the database
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
      return null; // Return null to indicate unauthorized access
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

module.exports = {
  registerAgencyService,
  getPendingHostService,
};
