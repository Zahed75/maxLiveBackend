const jwt= require('jsonwebtoken');
const User=require('../User/model');

const {
    BadRequest,
    Unauthorized,
    Forbidden,
    NoContent,
}=require('../../utility/errors');

const {generateOTP}=require('../../utility/common');
const nodemailer = require("nodemailer");


const{SendEmailUtility}=require('../../utility/email');
const createToken = require('../../utility/createToken');
const bcrypt = require('bcryptjs');
const { decrypt } = require('dotenv');






// Admin Register a new user

const userRegisterService = async (userData) => {
  try {
    const { email } = userData;
    const otp = await generateAndSendOTPService(email);
    const newUser = await User.create({ ...userData, otp });
    if (!newUser) {
      throw new BadRequest("Could Not Create User");
    }
    return newUser;
  } catch (error) {
    throw new Error("Error registering user: " + error.message);
  }
};




const verifyOTPService = async (email, otp) => {
  try {
    const user = await User.findOne({ email, otp });
    if (!user) {
      throw new BadRequest("Invalid OTP.");
    }

    // Update user
    user.isActive = true;
    user.isVerified = true;
    user.otp = undefined; // Clear OTP after verification
    await user.save();
  } catch (error) {
    throw new BadRequest("Failed to verify OTP.");
  }
};


// Resend OTP

const resendOTP=async (email) =>{
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
        throw new BadRequest('User not found.');
    }

    // Generate new OTP
    const newOTP = generateOTP();
    user.otp = newOTP;
    await user.save();

    // Send OTP to email
    await SendEmailUtility(email, 'New OTP', `Your new OTP: ${newOTP}`);

    return { message: 'New OTP sent successfully.' };
} catch (error) {
    throw new BadRequest('Failed to resend OTP.');
}};




// Expire OTP
const expireOTP = async (data) => {
  const { email } = data;
  await User.updateOne(
    { email },
    { $unset: { otp: 1, changedEmail: 1, emailChangeOTP: 1 } }
  );
  return;
};






//SignIn Admin

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "shahriartasin2000@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});

function sendOTP(email, otp) {
  const mailOptions = {
    from: "shahriartasin2000@gmail.com",
    to: email,
    subject: "OTP for Sign-in",
    text: `Your OTP for sign-in is: ${otp}`,
  };

  return transporter.sendMail(mailOptions);
}

const generateAndSendOTPService = async (email) => {
  try {
    const otp = generateOTP();
    await sendOTP(email, otp);
    return otp;
  } catch (error) {
    throw new Error("Error generating and sending OTP: " + error.message);
  }
};












module.exports = {
  userRegisterService,
  verifyOTPService,
  resendOTP,
  expireOTP,
  generateAndSendOTPService
};


  
 



