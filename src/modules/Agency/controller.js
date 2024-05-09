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


const registerAgencyHandler = asyncHandler(async (req, res) => {
  try {
    
    const userId = req.params._id; // Assuming userId is available in the request
    const agencyData = { ...req.body, userId };

    // Generate agencyId in the backend
    const agencyId = generateAgencyId(); // Implement generateAgencyId function

    // Add agencyId to the agencyData
    agencyData.agencyId = agencyId;

    // Call the service function to register the agency
    const result = await agencyService.registerAgencyService(agencyData);
    res.status(result.status).json(result);
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

const approveHostHandler = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const role = req.body.role;

  try {
    const host = await agencyService.approveHostService(userId, role);
    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }

    res.status(200).json({ message: 'Host approved successfully', host });
  } catch (error) {
    console.error('Error approving host:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const generateAgencyId = () => {
  const timestamp = new Date().getTime();
  const randomNumber = Math.floor(Math.random() * 1000000);
  const agencyId = `AGY${timestamp}${randomNumber}`;
  return agencyId;
};

router.post("/registerAgency/:_id", registerAgencyHandler);
router.get("/getAllPendingHostHandler",authMiddleware,
roleMiddleware([AGENCY_OWNER, ADMIN]),getAllPendingHostHandler);
router.post("/approveHostHandler",authMiddleware,roleMiddleware([AGENCY_OWNER, ADMIN]),approveHostHandler)
module.exports = router;
