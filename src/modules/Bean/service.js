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


const sendBeansFromADToBRService = async (adId, brId, amount) => {
  try {
    // Validate and convert IDs to ObjectId
    if (!mongoose.Types.ObjectId.isValid(adId) || !mongoose.Types.ObjectId.isValid(brId)) {
      throw new Error('Invalid user ID format.');
    }

    const adUserId = mongoose.Types.ObjectId(adId);
    const brUserId = mongoose.Types.ObjectId(brId);

    const adUser = await User.findById(adUserId);
    const brUser = await User.findById(brUserId);

    if (!adUser) throw new Error('Admin (AD) user not found.');
    if (!brUser) throw new Error('Bean Reseller (BR) user not found.');
    if (adUser.role !== 'AD') throw new Error('Sender is not authorized as Admin (AD).');
    if (brUser.role !== 'BR') throw new Error('Recipient is not authorized as Bean Reseller (BR).');

    const beansAmount = parseInt(amount, 10);

    if (adUser.beans < beansAmount) {
      throw new Error('Insufficient beans.');
    }

    // Update only the beans field
    await User.findByIdAndUpdate(adUserId, { $inc: { beans: -beansAmount } }, { new: true, runValidators: false });
    await User.findByIdAndUpdate(brUserId, { $inc: { beans: beansAmount } }, { new: true, runValidators: false });

    const transaction = new Bean({
      userId: adUserId,
      amount: beansAmount,
      transactionType: 'send'
    });
    await transaction.save();

    return { message: 'Beans sent successfully.' };
  } catch (error) {
    console.error('Error in sendBeansFromADToBRService:', error);
    throw error;
  }
};









module.exports = {

    sendBeansFromMPToADService,
    sendBeansFromADToBRService

}
