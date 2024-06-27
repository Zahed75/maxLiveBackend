const express = require("express");
const agencyModel = require("./model");
const multer = require('multer');
const router = express.Router();
const upload = multer();
const agencyService = require("../Agency/service");
const { asyncHandler } = require("../../utility/common");
const roleMiddleware = require('../../middlewares/roleMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const multerMiddleware = require('../../middlewares/multerMiddlware');
const {
  AGENCY_OWNER,
  ADMIN,
  MASTER_PORTAL
} = require('../../config/constants');
const { BadRequest } = require("../../utility/errors");
const { messaging } = require("firebase-admin");






const registerAgencyHandler = asyncHandler(async (req, res) => {
  try {
    const userId = req.params._id;

    const result = await agencyService.registerAgencyService(userId, req.body, req.files);


    res.status(result.status).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
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






const approveHostHandler = async (req, res) => {
  try {
    const updatedHost = await agencyService.approveHostService(req.params.userId, req.body.role);
    res.status(200).json(updatedHost);
  } catch (error) {
    console.error("Error approving host:", error.message);
    res.status(500).json({ message: "Error approving host", error: error.message });
  }
};






const signinAgencyController = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const sanitizedUser = await agencyService.signinAgencyService(email, password);

    // Respond with sanitized user data
    res.status(200).json({ message: "sign in success", user: sanitizedUser });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: 'Email Password is incorrect' });
  }
});





const updateAgencyHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const profilePicturePath = req.files['profilePicture'] ? req.files['profilePicture'][0].path : '';

  const editAgency = await agencyService.updateAgencyById(id, req.body, profilePicturePath);
  res.status(200).json({
    message: "Agency Updated Successfully!",
    editAgency
  });

});




const getAllHostsByAgency = asyncHandler(async (req, res) => {
  const { agencyId } = req.query;

  if (!agencyId) {
    return res.status(400).json({ message: 'Agency ID is required' });
  }

  const hosts = await agencyService.getAllHostsByAgency(agencyId);

  res.status(200).json({
    message: 'Hosts fetched successfully',
    hosts
  })
})





const getHostbyIdHandler = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const host = await agencyService.detailsHostByUserId(id);
  res.status(200).json({
    message: "Host Details Fetched Successfully!",
    host
  })
})




const passResetHandler = asyncHandler(async (req, res) => {
  const { adminId, userId, newPassword } = req.body;

  // Validate input
  if (!adminId || !userId || !newPassword) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  // Call the service to reset the password
  const user = await agencyService.passwordResetService(adminId, userId, newPassword);
  res.status(200).json({
    message: "Password Reset Successfully!",
    user
  });
});


// change the agency password








const blockHostHandler = asyncHandler(async (req, res) => {
  console.log("Request Body:", req.body); // Log the request body

  const { adminId, hostId } = req.body;

  if (!adminId || !hostId) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  try {
    const host = await agencyService.blockHostService(adminId, hostId);
    res.status(200).json({
      message: "Host Blocked Successfully!",
      host,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





//update Block Host Controller
const unblockHostHandler = asyncHandler(async (req, res) => {

  const { adminId, hostId } = req.body;

  const users = await agencyService.unblockHostService(adminId, hostId);
  res.status(200).json({
    message: "Host Unblocked Successfully!",
    users
  })

});








// agency password Reset

const AgencypassResetHandler = asyncHandler(async (req, res) => {
  const { adminId, userId, newPassword } = req.body;

  // Validate input
  if (!adminId || !userId || !newPassword) {
    return res.status(400).json({ message: "Please provide all required fields" });
  }

  try {
    // Call the service to reset the password
    const user = await passwordResetAgency(adminId, userId, newPassword);

    res.status(200).json({
      message: "Password reset successfully!",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





// Controller function to get agency details by ID
const getAgencyDetailsById = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const agency = await agencyService.getAgencyById(id);

  if (!agency) {
    throw new NotFound('Agency not found');
  }

  res.status(200).json({
    message: "Agency Details Successfully!",
    agency
  })
})



const transferHostToAgencyHandler = asyncHandler(async (req, res) => {
  const { hostId, newAgencyId } = req.body;

  // Validate request body
  if (!hostId || !newAgencyId) {
    return res.status(400).json({ message: 'Host ID and new Agency ID are required' });
  }

  // Call the service function
  const updatedHost = await agencyService.transferHostToAgency(hostId, newAgencyId);

  res.status(200).json({ message: 'Host transferred successfully', updatedHost });
});


const createExchangeRequestHandler = asyncHandler(async (req, res) => {
  const { hostId, diamonds } = req.body;

  // Validate request body
  if (!hostId || !diamonds) {
    return res.status(400).json({ message: 'Host ID and Diamonds are required' });
  }

  // Call the service function
  const updatedHost = await agencyService.createExchangeRequest(hostId, diamonds);

  res.status(updatedHost.status).json({ message: updatedHost.message, host: updatedHost.host });
});
const acceptExchangeRequestHandler = asyncHandler(async (req, res) => {
  const { hostId } = req.query;
  if (!hostId) {
    return res.status(400).json({ message: 'Host ID is required' });
  }

  const response = await agencyService.acceptExchangeRequest(hostId);

  res.status(response.status).json({ message: response.message, host: response.host });
});
const declineExchangeRequestHandler = asyncHandler(async (req, res) => {
  const { hostId } = req.query;
  if (!hostId) {
    return res.status(400).json({ message: 'Host ID is required' });
  }

  const response = await agencyService.declineExchangeRequest(hostId);

  res.status(response.status).json({ message: response.message, host: response.host });
});


const countryAgencyTargetGraphHandler = asyncHandler(async (req, res) => {
  const response = await agencyService.countryAgencyTargetGraphService();

  res.status(response.status).json({ message: response.message, result: response.countryTargets });
});



router.put('/unblock-host', unblockHostHandler);
router.patch('/setPassword', authMiddleware, roleMiddleware([MASTER_PORTAL]), passResetHandler);
router.post("/registerAgency/:_id", multerMiddleware.upload.fields([
  { name: 'nidPhotoFront', maxCount: 1 },
  { name: 'nidPhotoBack', maxCount: 1 },
  { name: 'profilePicture', maxCount: 1 }
]), registerAgencyHandler);
router.put("/getAllPendingHostHandler", getAllPendingHostHandler);
router.post("/approveHostHandler/:userId", approveHostHandler)
router.post("/agencySignin", signinAgencyController);
router.put("/:id", multerMiddleware.upload.fields([
  { name: 'profilePicture', maxCount: 1 }
]), updateAgencyHandler);
router.get('/hosts', getAllHostsByAgency);
router.get('/countryAgencyTargetGraph', countryAgencyTargetGraphHandler)

router.post('/declined', blockHostHandler);
router.post('/agencyPassReset', AgencypassResetHandler);
router.get('/detailsAgency/:id', getAgencyDetailsById);
router.patch('/transferHost', transferHostToAgencyHandler);
router.post('/createExchangeRequest', createExchangeRequestHandler);
router.post('/acceptExchangeRequest', acceptExchangeRequestHandler)
router.post('/declineExchangeRequest', declineExchangeRequestHandler)
router.get('/:id', getHostbyIdHandler);

module.exports = router;
