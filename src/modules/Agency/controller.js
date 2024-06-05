const express = require("express");
const agencyModel = require("./model");
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
  MASTER_PORTAL
}=require('../../config/constants');
const { BadRequest } = require("../../utility/errors");
const { messaging } = require("firebase-admin");


const registerAgencyHandler = asyncHandler(async (req, res) => {
  try {
    const userId = req.params._id; // Assuming userId is available in the request

    // Call the service function to handle agency registration
    const result = await agencyService.registerAgencyService(userId, req.body, req.files);

    // Send response based on the result
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
    res.status(200).json({message:"sign in success",user :sanitizedUser});
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: 'Email Password is incorrect' });
  }
});





const updateAgencyHandler=asyncHandler(async(req,res)=>{
    const {id} = req.params;
    const editAgency = await agencyService.updateAgencyById(id,req.body);
    res.status(200).json({
      message:"Agency Updated Successfully!",
      editAgency
    });

});




const getAllHostsByAgency = asyncHandler(async(req,res)=>{
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





const getHostbyIdHandler = asyncHandler(async(req,res)=>{
  const {id} = req.params;
  const host = await agencyService.detailsHostByUserId(id);
  res.status(200).json({
    message:"Host Details Fetched Successfully!",
    host
  })
})



const passResetHandler = asyncHandler(async(req,res)=>{
  const { adminId, userId, newPassword } = req.body;

 
    // Validate input
    if (!adminId || !userId || !newPassword) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    // Call the service to reset the password
    const user = await agencyService.passwordResetService(adminId, userId, newPassword);
    
    res.status(200).json({
      message:"Password Reset SuccessFully!",
      user
    })
  
});




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
  
  const { adminId,hostId } =req.body;
  
  const users = await agencyService.unblockHostService(adminId,hostId);
  res.status(200).json({
    message:"Host Unblocked Successfully!",
    users
  })

});


// get all agency list handler

// const getAllAgenciesHandler = asyncHandler(async (req, res) => {
//   const { page, limit } = req.query;

//   console.log('Request query parameters:', { page, limit }); // Debug log

//   try {
//     const agencies = await agencyService.getAllAgenciesService(page, limit);
//     res.status(200).json({
//       message: "Get All Agency List Successfully!",
//       agencies,
//     });
//   } catch (error) {
//     console.error('Error in getAllAgenciesHandler:', error.message); // Debug log
//     res.status(500).json({ message: error.message });
//   }
// });












router.put('/unblock-host',unblockHostHandler);

router.put('/setPassword',passResetHandler);

router.post("/registerAgency/:_id", upload.fields([{ name: 'nidPhotoFront', maxCount: 1 }, { name: 'nidPhotoBack', maxCount: 1 }]), registerAgencyHandler);

router.put("/getAllPendingHostHandler",authMiddleware,roleMiddleware([AGENCY_OWNER,ADMIN,MASTER_PORTAL]),getAllPendingHostHandler);
router.post("/approveHostHandler/:userId",approveHostHandler)

router.post("/agencySignin",signinAgencyController);
router.put("/:id",updateAgencyHandler);
router.get('/hosts',getAllHostsByAgency);
router.get('/:id',getHostbyIdHandler);

router.post('/declined',blockHostHandler);



module.exports = router;
