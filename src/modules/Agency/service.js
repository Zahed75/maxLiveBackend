const agencyModel = require('./model');
const { NotFound, BadRequest } = require("../../utility/errors");

const registerAgencyService = async (agencyData) => {
    try {
        const { agencyName, agencyHolderName, country, presentAddress, email, phone} = agencyData;
        if (!agencyName || !agencyHolderName || !country || !presentAddress || !email || !phone) {
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

        return { status: 201, message: "Agency registered successfully", agency: newAgency };
    } catch (error) {
        console.error("Error registering agency:", error);
        return { status: 500, message: "Internal server error" };
    }
};


module.exports={
    registerAgencyService
};

    