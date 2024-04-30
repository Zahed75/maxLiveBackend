const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./model");
const { NotFound, BadRequest } = require("../../utility/errors");
const firebase = require("../../utility/firebaseConfig");
const {generateOTP} = require("../../utility/common");
const nodemailer = require('nodemailer');

const userRegisterService = async (userData) => {
  const newUser = await User.create(userData);
  if (!newUser) {
    throw new BadRequest("Could Not Create User");
  }
  return newUser;
};

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
    throw new Error("Failed to reset password.");
  }
};

//getAllUser

const getSocialUserById = async (userId) => {
  try {
    const user = await firebase.getUserById(userId);
    return user;
  } catch (error) {
    console.log(error);
  }
};

const saveUserService = async (userData) => {
  const newUser = await User.create(userData);
  if (!newUser) {
    throw new BadRequest("Could Not Create User");
  }
  return newUser;
};

const getAllUserService = async () => {
  const Users = await User.find();
  if (!Users) {
    throw new BadRequest("Could Not find Users");
  }
  return Users;
};

const updateUserInfoService = async (userId, updatedInfo) => {
  const updatedResult = await User.findByIdAndUpdate(userId, updatedInfo, {
    new: true,
  });
  if (!updatedResult) {
    throw new Error("User info to update not found");
  }

  return updatedResult;
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shahriartasin2000@gmail.com',
    pass: process.env.EMAIL_PASS,
  },
});

function sendOTP(email, otp) {
  const mailOptions = {
    from: 'shahriartasin2000@gmail.com',
    to: email,
    subject: 'OTP for Sign-in',
    text: `Your OTP for sign-in is: ${otp}`,
  };

  return transporter.sendMail(mailOptions);
}

const generateAndSendOTPService = async(email)=>{
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const otp = generateOTP();
    user.otp = otp;
    await user.save();
    await sendOTP(email, otp);
  } catch (error) {
    throw new Error('Error generating and sending OTP: ' + error.message);
  }
};

const verifyOTPService= async (email, otp) => {
  try {
      const user = await User.findOne({ email, otp });
      if (!user) {
          throw new BadRequest('Invalid OTP.');
      }

      // Update user
      user.isActive = true;
      user.isVerified = true;
      user.otp = undefined; // Clear OTP after verification
      await user.save();
  } catch (error) {
      throw new BadRequest('Failed to verify OTP.');
  }
};




module.exports = {
  resetPassword,
  getSocialUserById,
  saveUserService,
  userRegisterService,
  getAllUserService,
  updateUserInfoService,
  generateAndSendOTPService,
  verifyOTPService
};
