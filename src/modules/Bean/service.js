const agencyModel = require("../Agency/model");
const User = require("../User/model");
const Host = require("../Host/model");
const { NotFound, BadRequest } = require("../../utility/errors");
const { asyncHandler } = require("../../utility/common");

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






module.exports = {

    sendBeansFromMPToADService

}
