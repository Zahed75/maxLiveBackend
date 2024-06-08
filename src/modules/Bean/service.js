const agencyModel = require("../Agency/model");
const User = require("../User/model");
const Host = require("../Host/model");
const { NotFound, BadRequest } = require("../../utility/errors");
const { asyncHandler } = require("../../utility/common");
const mongoose = require('mongoose');
const Bean = require('../Bean/model'); // Adjust this path as necessary





const sendBeansFromMPToADService = async (mpId, adId, amount, assetType) => {
  try {
    const mpUser = await User.findById(mpId);
    const adUser = await User.findById(adId);

    if (!mpUser) throw new Error('Master Portal (MP) user not found.');
    if (!adUser) throw new Error('Admin (AD) user not found.');
    if (mpUser.role !== 'MP') throw new Error('Sender is not authorized as Master Portal (MP).');
    if (adUser.role !== 'AD') throw new Error('Recipient is not authorized as Admin (AD).');

    const validAssets = ['beans', 'coins', 'diamonds', 'stars'];
    if (!validAssets.includes(assetType)) {
      throw new Error('Invalid asset type.');
    }

    const assetAmount = parseInt(amount, 10);

    // MP does not need to have any initial amounts of these assets
    // So no need to check for mpUser.assetType < assetAmount

    // Update only the specified asset field
    await User.findByIdAndUpdate(adId, { $inc: { [assetType]: assetAmount } }, { new: true, runValidators: false });

    const transaction = new Bean({
      userId: mpId,
      amount: assetAmount,
      transactionType: 'send',
      assetType: assetType
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

const sendBeansAllUsers = async (resellerId, recipientId, amount) => {
  try {
    const reseller = await User.findById(resellerId);
    const recipient = await User.findById(recipientId);
    const agency = await agencyModel.findById(recipientId); // Correctly fetching the agency using recipientId

    if (!reseller || reseller.role !== 'BR') {
      return { status: 400, message: 'Reseller not found or not authorized' };
    }

    if (!recipient && !agency) {
      return { status: 400, message: 'Recipient not found' };
    }

    if (reseller.beans < amount) {
      return { status: 400, message: 'Insufficient beans' };
    }

    // Deduct beans from reseller
    reseller.beans -= amount;

    // Add beans to recipient
    if (recipient) {
      recipient.beans += amount;
      await recipient.save();
    }

    if (agency) {
      agency.beans += amount;
      await agency.save();
    }

    await reseller.save();

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
    sendAssetsADToBR,
    sendBeansAllUsers,
    sendBeansFromAgencyToHost

}
