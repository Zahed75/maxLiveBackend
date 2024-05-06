const express = require("express");
const router = express.Router();
const agencyService = require("../Agency/service");
const { asyncHandler } = require("../../utility/common");
const roleMiddleware = require('../../middlewares/roleMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const {
  AGENCY_OWNER,
  ADMIN,
}=require('../../config/constants');


const registerAgency = asyncHandler(async (req, res) => {
  try {
    // Check if the request body contains all required fields
    const {
      agencyName,
      agencyHolderName,
      country,
      presentAddress,
      email,
      phone,
    } = req.body;
    if (
      !agencyName ||
      !agencyHolderName ||
      !country ||
      !presentAddress ||
      !email ||
      !phone
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Call the service function to register the agency
    const result = await agencyService.registerAgencyService(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
const getAllPendingHostHandler = asyncHandler(async (req, res) => {
  const userRole = req.body.role;
  const pendingResult = await agencyService.getPendingHostService(userRole);
  if (!pendingResult) {
    return res.status(401).json({ message: "Failed to show pending result" }); // Unauthorized access
  }
  res.status(200).json(pendingResult); // Return the approval result
});

router.post("/registerAgency", registerAgency);
router.get("/getAllPendingHostHandler",authMiddleware,roleMiddleware([AGENCY_OWNER, ADMIN]),getAllPendingHostHandler);

module.exports = router;
