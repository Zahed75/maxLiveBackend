const agencyModel = require("../Agency/model");
const User = require("../User/model");
const Host = require("../Host/model");
const { NotFound, BadRequest } = require("../../utility/errors");
const { asyncHandler } = require("../../utility/common");
const mongoose = require('mongoose');
const Bean = require('../Bean/model'); // Adjust this path as necessary





const sendBeansFromMPToADService = async (mpId, adId, amount) => {
  try {
    const mpUser = await User.findById(mpId);
    const adUser = await User.findById(adId);

    if (!mpUser) throw new Error('Master Portal (MP) user not found.');
    if (!adUser) throw new Error('Admin (AD) user not found.');
    if (mpUser.role !== 'MP') throw new Error('Sender is not authorized as Master Portal (MP).');
    if (adUser.role !== 'AD') throw new Error('Recipient is not authorized as Admin (AD).');

    const beansAmount = parseInt(amount, 10);

    if (mpUser.beans < beansAmount) {
      throw new Error('Insufficient beans.');
    }

    // Update only the beans field
    await User.findByIdAndUpdate(mpId, { $inc: { beans: -beansAmount } }, { new: true, runValidators: false });
    await User.findByIdAndUpdate(adId, { $inc: { beans: beansAmount } }, { new: true, runValidators: false });

    const transaction = new Bean({
      userId: mpId,
      amount: beansAmount,
      transactionType: 'send'
    });
    
    await transaction.save();

    return { message: 'Beans sent successfully.' ,transaction};
  } catch (error) {
    console.error('Error in sendBeansFromMPToADService:', error);
    throw error;
  }
};




// send Beans Admin TO Reseller

const sendBeansADToBR = async (adminId, resellerId, amount) => {
  try {
    const admin = await User.findById(adminId);
    const reseller = await User.findById(resellerId);

    if (!admin || admin.role !== 'AD') {
      return { status: 400, message: 'Admin not found or not authorized' };
    }

    if (!reseller || reseller.role !== 'BR') {
      return { status: 400, message: 'Reseller not found or not authorized' };
    }

    if (admin.beans < amount) {
      return { status: 400, message: 'Insufficient beans' };
    }

    admin.beans -= amount;
    reseller.beans += amount;

    await admin.save();
    await reseller.save();

    const transaction = new Bean({
      userId: adminId,
      amount: amount,
      transactionType: 'send',
    });

    await transaction.save();

    return { status: 200, message: 'Beans sent successfully', transaction };
  } catch (error) {
    console.error('Error sending beans:', error);
    return { status: 500, message: 'Internal server error' };
  }
};




// services/beanService.js

const sendBeansAllUsers = async (resellerId, recipientId, amount) => {
  try {
    const reseller = await User.findById(resellerId);
    const recipient = await agencyModel.findById(recipientId);

    if (!reseller || reseller.role !== 'BR') {
      return { status: 400, message: 'Reseller not found or not authorized' };
    }

    if (!recipient || !['BU', 'HO', 'AG'].includes(recipient.role)) {
      return { status: 400, message: 'Recipient not found or not authorized' };
    }

    if (reseller.beans < amount) {
      return { status: 400, message: 'Insufficient beans' };
    }

    reseller.beans -= amount;
    recipient.beans += amount;

    await reseller.save();
    await recipient.save();

    const transaction = new Bean({
      userId: resellerId,
      amount: amount,
      transactionType: 'send',
    });

    await transaction.save();

    return { status: 200, message: 'Beans sent successfully', transaction };
  } catch (error) {
    console.error('Error sending beans:', error);
    return { status: 500, message: 'Internal server error' };
  }
};







const sendBeansFromAgencyToHost = async (agencyId, hostId, amount) => {
  try {
    const agency = await agencyModel.findById(agencyId);
    const host = await Host.findById(hostId);

    if (!agency || agency.role !== 'AG') {
      return { status: 400, message: 'Agency not found or not authorized' };
    }

    if (!host || host.role !== 'HO') {
      return { status: 400, message: 'Host not found or not authorized' };
    }

    if (agency.beans < amount) {
      return { status: 400, message: 'Insufficient beans' };
    }

    agency.beans -= amount;
    host.beans += amount;

    await agency.save();
    await host.save();

    const transaction = new Bean({
      userId: agencyId,
      amount: amount,
      transactionType: 'send',
    });

    await transaction.save();

    return { status: 200, message: 'Beans sent successfully', transaction };
  } catch (error) {
    console.error('Error sending beans:', error);
    return { status: 500, message: 'Internal server error' };
  }
};






module.exports = {

    sendBeansFromMPToADService,
    sendBeansADToBR,
    sendBeansAllUsers,
    sendBeansFromAgencyToHost

}
