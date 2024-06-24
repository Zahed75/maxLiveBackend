const express = require("express");
const Bean = require('../Bean/model');
const multer = require('multer');
const router = express.Router();
const upload = multer();
const agencyService = require("../Agency/service");
const { asyncHandler } = require("../../utility/common");
const roleMiddleware = require('../../middlewares/roleMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const {
  AGENCY_OWNER,
  ADMIN,
  MASTER_PORTAL,
  HOST,
  BASIC_USER
} = require('../../config/constants');
const { BadRequest } = require("../../utility/errors");
const { messaging } = require("firebase-admin");

const beansService = require('../Bean/service');



// send Beans to Master Portal to Admin

const sendBeansFromMPToBRHandler = asyncHandler(async (req, res) => {
  try {
    const { mpId, userId, amount, assetType } = req.body;

    const result = await beansService.sendBeansFromMPToADService(mpId, userId, amount, assetType);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in sendAssetsFromMPToADHandler:', error);
    res.status(500).json({ error: error.message });
  }
});





// sends beans Admin to resller 
const sendAssetsToBRHandler = asyncHandler(async (req, res) => {
  const { adminId, resellerId, amount, assetType } = req.body;

  if (!adminId || !resellerId || !amount || !assetType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const result = await beansService.sendAssetsADToBR(adminId, resellerId, amount, assetType);

  res.status(result.status).json({
    message: result.message,
    result
  });
});



const sendAssetsToUserHandler = asyncHandler(async (req, res) => {
  const { resellerId, recipientId, amount, assetType } = req.body;

  if (!resellerId || !recipientId || !amount || !assetType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const result = await beansService.sendAssetsAllUsers(resellerId, recipientId, amount, assetType);

  res.status(result.status).json({
    message: result.message,
    result
  })
});









const sendAssetsFromAgencyToHostHandler = asyncHandler(async (req, res) => {
  const { agencyId, hostId, amount, assetType } = req.body;

  if (!agencyId || !hostId || !amount || !assetType) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const result = await beansService.sendAssetsFromAgencyToHost(agencyId, hostId, amount, assetType);
  res.status(result.status).json({
    message: result.message,
    status: result.status,
    transaction: result.transaction
  })
});



const getBeansSentByUser = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required query parameters: userId, startDate, endDate' });
    }

    const result = await beansService.getBeansSentByUserService(userId, startDate, endDate);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};






router.post('/send-beans-MP-to-user', sendBeansFromMPToBRHandler);
// router.post('/send-beans-to-reseller', sendAssetsToBRHandler);
router.patch('/send-assets-to-allusers', sendAssetsToUserHandler);
router.patch('/send-beans-to-host', sendAssetsFromAgencyToHostHandler)
router.get('/beans-sent', getBeansSentByUser)
module.exports = router;