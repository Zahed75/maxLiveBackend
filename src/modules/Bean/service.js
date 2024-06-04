const agencyModel = require("../Agency/model");
const User = require("../User/model");
const Host = require("../Host/model");
const { NotFound, BadRequest } = require("../../utility/errors");
const { asyncHandler } = require("../../utility/common");
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken');
const mongoose = require("mongoose");
const Bean = require('../Admin/model');



const sendBeansToAdminService = async (userId, adminId, amount) => {
  try {
    // Fetch the user and admin details
    const user = await User.findById(userId);
    const admin = await User.findById(adminId);

    // Check if user and admin exist
    if (!user || !admin) {
      throw new Error('User or Admin not found.');
    }

    // Check if the user has enough beans
    if (user.beans < amount) {
      throw new Error('Insufficient beans.');
    }

    // Deduct beans from user and add to admin
    user.beans -= amount;
    admin.beans += amount;

    // Save the updated user and admin details
    await user.save();
    await admin.save();

    // Record the transaction in the Bean model
    const transaction = new Bean({
      userId,
      amount,
      transactionType: 'send'
    });
    await transaction.save();

    return { message: 'Beans sent successfully.', user, admin };
  } catch (error) {
    console.error(error);
    throw error;
  }
};










module.exports = {

    sendBeansToAdminService

}
