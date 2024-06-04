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




const sendBeansToAdminController = asyncHandler(async (req, res) => {
    try {
      const { userId, adminId, amount } = req.body;
  
      // Call the service to send beans
      const result = await sendBeansToAdminService(userId, adminId, amount);
  
      // Respond with the result
      res.status(200).json(result);
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });




  router.post('/send-beans-to-admin', sendBeansToAdminController);



module.exports = router;