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
const { IosApp } = require('firebase-admin/project-management');
const { captureRejectionSymbol } = require('nodemailer/lib/xoauth2');



const registerUserService = async (userData) => {
  try {
    const { email, profilePicture } = userData;

    // Generate OTP and send
    const otp = await generateAndSendOTPService(email);

    // Create a new user with profile picture and NID photos
    const newUser = await User.create({ ...userData, otp });
    
    if (!newUser) {
      throw new BadRequest("Could Not Create User");
    }

    // Update the newly created user with NID photo URLs
    await User.findByIdAndUpdate(newUser._id, { $set: { profilePicture } });

    return { status: 201, message: 'User registered successfully', user: newUser };
  } catch (error) {
    console.error('Error registering user:', error);
    return { status: 500, message: 'Internal server error' };
  }
};



// registerMasterPortal

const registerMasterPortalUser = async (userData) =>{
  // Check if email already exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Create the user with the provided data
  const user = new User({
    ...userData,
    role: 'MP',
    isVerified: true,
    isActive:true
  });

  // Save the user to the database
  await user.save();

  return user;
}








const verifyOTPService = async (email, otp) => {
  try {
    const user = await User.findOne({ email, otp });
    if (!user) {
      throw new BadRequest("Invalid OTP.");
    }

    // Update user
    user.isActive = true;
    user.isVerified = true;
    user.isApproved = true;
    user.otp = undefined; // Clear OTP after verification
    await user.save();
  } catch (error) {
    console.log(error)
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
    user: "tim.ben1248@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});

function sendOTP(email, otp) {
  const mailOptions = {
    from: "tim.ben1248@gmail.com",//need to change
    to: email,
    subject: "OTP for Sign-in",
    text: `Your OTP for sign-in is: ${otp}`,
  };

  return transporter.sendMail(mailOptions);
}

const generateAndSendOTPService = async (email) => {
  try {
    // console.log(email)
    const otp = generateOTP();
    await sendOTP(email, otp);
    return otp;
  } catch (error) {
    throw new Error("Error generating and sending OTP: " + error.message);
  }
};




const signinUserService = async (email,password) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      throw new BadRequest("Invalid email or password.");
    }

    // Validate password using bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);

    // Check password match
    if (!isMatch) {
      throw new BadRequest("Invalid email or password.");
    }
 // Generate JWT token with user data payload
 const accessToken = jwt.sign({ user }, 'SecretKey12345', { expiresIn: '3d' });
    // User is authenticated, return sanitized user data (excluding sensitive fields)
    const sanitizedUser = {
      accessToken,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
     
      
    };

    return sanitizedUser;
  } catch (error) {
    console.error(error);
    throw error; 
  }
};








module.exports = {
  registerUserService,
  verifyOTPService,
  resendOTP,
  expireOTP,
  generateAndSendOTPService,
  signinUserService,
  registerMasterPortalUser
};


  
 



