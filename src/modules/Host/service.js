const User = require("../User/model");
const Agency = require("../Agency/model");
const { generateHostId } = require("../../utility/common");

const applyToBeHostService = async (
  userId,
  agencyId,
  hostType,
  hostId,
  nidFrontPath,
  nidBackPath
) => {
  try {
    // Find the user in the User model
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if the agency exists
    const agency = await Agency.findOne({ agencyId: agencyId });
    if (!agency) {
      throw new Error("Agency not found");
    }

    // Update the user's host status to "Pending"
    user.hostStatus = "pending";
    user.hostType = hostType;
    user.hostId = hostId;
    user.agencyId = agencyId;
    user.isActive = user.isActive;
    user.isVerified = user.isVerified;
    user.isApproved = user.isApproved;
    user.profilePicture = user.profilePicture;
    user.nidFront = nidFrontPath;
    user.nidBack = nidBackPath;
    await user.save();

    return user;
  } catch (error) {
    console.error("Error applying to be host:", error);
    throw error;
  }
};



module.exports = {
   applyToBeHostService
   };
