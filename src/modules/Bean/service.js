const agencyModel = require("../Agency/model");
const User = require("../User/model");
const Host = require("../Host/model");
const { NotFound, BadRequest } = require("../../utility/errors");
const { asyncHandler } = require("../../utility/common");
const mongoose = require('mongoose');
const Bean = require('../Bean/model'); // Adjust this path as necessary





const sendBeansFromMPToADService = async (mpId, maxId, amount, assetType) => {
  try {
    const mpUser = await User.findById(mpId);
    let user = await User.findOne({ maxId });
    console.log(user)

    if (!user) {
      user = await agencyModel.findOne({ maxId })
    }
    if (!user) {
      user = await Host.findOne({ maxId })
    }
    if (!mpUser) throw new Error('Master Portal (MP) user not found.');
    if (!user) throw new Error('User not found.');
    if (mpUser.role !== 'MP') throw new Error('Sender is not authorized as Master Portal (MP).');

    const validAssets = ['beans', 'coins', 'diamonds', 'stars'];
    if (!validAssets.includes(assetType)) {
      throw new Error('Invalid asset type.');
    }

    const assetAmount = parseInt(amount, 10);

    // MP does not need to have any initial amounts of these assets
    // So no need to check for mpUser.assetType < assetAmount

    // Update only the specified asset field
    // await User.findByIdAndUpdate(userId, { $inc: { [assetType]: assetAmount } }, { new: true, runValidators: false });
    user[assetType] += assetAmount
    user.save()
    const transaction = new Bean({
      userId: mpId,
      amount: assetAmount,
      transactionType: 'send',
      assetType: assetType,
      recipientId: maxId
    });

    await transaction.save();
    return { message: `${assetType} sent successfully.`, transaction };
  } catch (error) {
    console.error('Error in sendAssetsFromMPToADService:', error);
    throw error;
  }
};



// send Beans Admin TO Reseller

const sendAssetsADToBR = async (adminId, resellerId, amount, assetType) => {
  try {
    const admin = await User.findById(adminId);
    const reseller = await User.findById(resellerId);

    if (!admin || admin.role !== 'AD') {
      return { status: 400, message: 'Admin not found or not authorized' };
    }

    if (!reseller || reseller.role !== 'BR') {
      return { status: 400, message: 'Reseller not found or not authorized' };
    }

    const validAssets = ['beans', 'coins', 'stars', 'diamonds'];
    if (!validAssets.includes(assetType)) {
      return { status: 400, message: 'Invalid asset type' };
    }

    const assetAmount = parseInt(amount, 10);

    if (admin[assetType] < assetAmount) {
      return { status: 400, message: 'Insufficient ' + assetType };
    }

    admin[assetType] -= assetAmount;
    reseller[assetType] += assetAmount;

    await admin.save();
    await reseller.save();

    const transaction = new Bean({
      userId: adminId,
      amount: assetAmount,
      transactionType: 'send',
      assetType: assetType
    });

    await transaction.save();

    return { status: 200, message: `${assetType} sent successfully`, transaction };
  } catch (error) {
    console.error('Error sending assets:', error);
    return { status: 500, message: 'Internal server error' };
  }
};





// services/beanService.js

const sendAssetsAllUsers = async (resellerId, recipientId, amount, assetType) => {
  try {
    const reseller = await User.findById(resellerId);
    let recipient = await User.findOne({ maxId: recipientId });
    if (!recipient) {
      recipient = await agencyModel.findOne({ maxId: recipientId }); // Correctly fetching the agency using recipientId
    }
    if (!recipient) {
      recipient = await Host.findOne({ maxId: recipientId }); // Correctly fetching the agency using recipientId

    }
    if (!reseller || reseller.role !== 'BR') {
      return { status: 400, message: 'Reseller not found or not authorized' };
    }

    if (!recipient) {
      return { status: 400, message: 'Recipient not found' };
    }
    const validAssets = ['beans', 'coins', 'stars', 'diamonds'];
    if (!validAssets.includes(assetType)) {
      return { status: 400, message: 'Invalid asset type' };
    }

    const assetAmount = parseInt(amount, 10);

    if (reseller[assetType] < assetAmount) {
      return { status: 400, message: 'Insufficient ' + assetType };
    }

    // Deduct asset from reseller
    reseller[assetType] -= assetAmount;

    // Add asset to recipient
    recipient[assetType] += assetAmount;
    await recipient.save();

    reseller.beansSent += assetAmount
    await reseller.save();

    const transaction = new Bean({
      userId: resellerId,
      amount: assetAmount,
      transactionType: 'send',
      assetType: assetType,
      recipientId: recipientId
    });

    await transaction.save();

    return { status: 200, message: `${assetType} sent successfully`, transaction };
  } catch (error) {
    console.error('Error sending assets:', error);
    return { status: 500, message: 'Internal server error' };
  }
};

module.exports = { sendAssetsAllUsers };




const sendAssetsFromAgencyToHost = async (agencyId, hostId, amount, assetType) => {
  try {
    const agency = await agencyModel.findById(agencyId);
    const host = await Host.findOne({maxId: hostId});

    if (!agency || agency.role !== 'AG') {
      return { status: 400, message: 'Agency not found or not authorized' };
    }

    if (!host || host.role !== 'HO') {
      return { status: 400, message: 'Host not found or not authorized' };
    }

    const validAssets = ['beans', 'coins', 'stars', 'diamonds'];
    if (!validAssets.includes(assetType)) {
      return { status: 400, message: 'Invalid asset type' };
    }

    const assetAmount = parseInt(amount, 10);

    if (agency[assetType] < assetAmount) {
      return { status: 400, message: 'Insufficient ' + assetType };
    }

    // Deduct asset from agency
    agency[assetType] -= assetAmount;

    // Add asset to host
    host[assetType] += assetAmount;

    
    const transaction = new Bean({
      userId: agencyId,
      amount: assetAmount,
      transactionType: 'send',
      assetType: assetType,
      recipientId: hostId
    });
    await agency.save();
    await host.save();
    await transaction.save();

    return { status: 200, message: `${assetType} sent successfully`, transaction };
  } catch (error) {
    console.error('Error sending assets:', error);
    return { status: 500, message: 'Internal server error' };
  }
};





const getBeansSentByUserService = async (userId, startDate, endDate) => {
  try {
    // Validate date inputs
    if (isNaN(Date.parse(startDate)) || isNaN(Date.parse(endDate))) {
      throw new BadRequest('Invalid date format');
    }

    // Convert to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ensure endDate is after startDate
    if (start > end) {
      throw new BadRequest('End date must be after start date');
    }

    // Find all transactions where beans were sent by the specified user within the date range
    const transactions = await Bean.find({
      userId: userId,
      transactionType: 'send',
      createdAt: {
        $gte: start,
        $lte: end
      }
    });

    if (!transactions.length) {
      return { message: 'No transactions found for the specified date range', transactions: [], totalBeansSent: 0 }
    }

    // Calculate the total beans sent
    const totalBeansSent = transactions.reduce((total, transaction) => total + transaction.amount, 0);

    return { totalBeansSent, transactions };
  } catch (error) {
    console.error('Error fetching beans sent by user:', error);
    throw error;
  }
};






module.exports = {

  sendBeansFromMPToADService,
  sendAssetsADToBR,
  sendAssetsAllUsers,
  sendAssetsFromAgencyToHost,
  getBeansSentByUserService,

}
