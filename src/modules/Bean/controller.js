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
}=require('../../config/constants');
const { BadRequest } = require("../../utility/errors");
const { messaging } = require("firebase-admin");

const beansService = require('../Bean/service');



// send Beans to Master Portal to Admin

const sendBeansFromMPToADHandler = asyncHandler(async (req, res) => {
    try {
      const { mpId, adId, amount } = req.body;
  
      const result = await beansService.sendBeansFromMPToADService(mpId, adId, amount);
  
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in sendBeansFromMPToADController:', error);
      res.status(500).json({ error: error.message });
    }
  });





// sends beans Admin to resller 
  const sendBeansToBRHandler = asyncHandler(async (req, res) => {
    const { adminId, resellerId, amount } = req.body;
  
    if (!adminId || !resellerId || !amount) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    const result = await beansService.sendBeansADToBR(adminId, resellerId, amount);
  
    res.status(result.status).json(result);
  });



  const sendBeansToUserHandler = asyncHandler(async (req, res) => {
    const { resellerId, recipientId, amount } = req.body;
  
    if (!resellerId || !recipientId || !amount) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    const result = await beansService.sendBeansAllUsers(resellerId, recipientId, amount);
  
    res.status(result.status).json(result);
  });


  const sendBeansFromAgencyToHostHandler = asyncHandler(async (req, res) => {
    const { agencyId, hostId, amount } = req.body;
  
    if (!agencyId || !hostId || !amount) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    const result = await beansService.sendBeansFromAgencyToHost(agencyId, hostId, amount);
  
    res.status(result.status).json(result);
  });
  





router.post('/send-beans-to-admin', sendBeansFromMPToADHandler);
router.post('/send-beans-to-reseller',sendBeansToBRHandler);
router.patch('/send-beans-to-allusers',sendBeansToUserHandler);
router.patch('/send-beans-to-host',sendBeansFromAgencyToHostHandler)

module.exports = router;