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

const { SendEmailUtility } = require("../../utility/email");
const createToken = require("../../utility/createToken");
const bcrypt = require("bcryptjs");
const { decrypt } = require("dotenv");
const { IosApp } = require("firebase-admin/project-management");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "shahriartasin2000@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});

function sendPass(email, password) {
  const mailOptions = {
    from: "shahriartasin2000@gmail.com", //need to change
    to: email,
    subject: "Password for Sign-in",
    text: `Your Password for sign-in is: ${password}`,
  };

  return transporter.sendMail(mailOptions);
}

const approveAgency = async (password, email, adminId) => {
  try {
    // Find the agency by email
    const agency = await agencyModel.findOne({ email });

    if (!agency) {
      throw new Error("Agency not found");
    }

    // Check the agency status
    if (agency.agencyStatus === "banned") {
      return "Agency is banned and cannot be approved.";
    }
    if (agency.agencyStatus === "active") {
      return "Agency is already approved.";
    }
    if (agency.agencyStatus !== "pending") {
      return "Agency is not in a state that can be approved.";
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Update the agency fields
    agency.agencyStatus = "active";
    agency.isApproved = true;
    agency.isActive = true;
    agency.password = hashedPassword; // You might want to hash the password before saving it
    agency.approvedBy = adminId;

    // Save the updated agency
    await agency.save();

    // Send the password email
    await sendPass(email, password);
    return agency;
  } catch (error) {
    console.error("Error approving agency:", error);
    throw new Error("An error occurred while approving the agency.");
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
const banAgencyService = async (agencyId) => {
  try {
    const agency = await agencyModel.findById(agencyId);

    if (!agency) {
      return { success: false, message: "Agency not found." };
    }

    agency.agencyStatus = "banned";
    agency.isActive = false;
    agency.isActive = false;
    agency.isApproved=false;
    await agency.save();
    return { success: true, message: "Agency banned successfully." };
  } catch (error) {
    console.error("Error banning agency:", error);
    return {
      success: false,
      message: "An error occurred while banning the agency.",
    };
  }
};
const disableAgencyService = async (agencyId) => {
  try {
    const agency = await agencyModel.findById(agencyId);

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
    const agency = await agencyModel.findById(AgencyId);

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



module.exports = {
  approveAgency,
  removeAgencyService,
  banAgencyService,
  disableAgencyService,
  grantMaxPowerService,
  makeAdminService,
  transferAgencyService,
  getAllAgencies,
  registerUserService
};
