const express = require("express");
const router = express.Router();
const agencyService = require('../Agency/service');
const { asyncHandler } = require("../../utility/common");


const registerAgency = async (req, res) => {
    try {
      // Check if the request body contains all required fields
      const { agencyName, agencyHolderName, country, presentAddress, email, phone,role } = req.body;
      if (!agencyName || !agencyHolderName || !country || !presentAddress || !email || !phone|| !role) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      // Call the service function to register the agency
      const result = await agencyService.registerAgencyService(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  router.use('/registerAgency',registerAgency);


  module.exports= router;