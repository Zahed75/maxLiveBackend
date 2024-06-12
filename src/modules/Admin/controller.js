const express = require("express");
const router = express.Router();

const {
  BASIC_USER,
  AGENCY_OWNER,
  MASTER_PORTAL,
  SUPER_ADMIN,
  ADMIN,
} = require("../../config/constants");

const adminService = require("./service");
const { adminValidate } = require("./request");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const authMiddleware = require("../../middlewares/authMiddleware");
const { asyncHandler } = require("../../utility/common");
const { messaging } = require("firebase-admin");


const approveAgencyHandler = asyncHandler(async (req, res) => {
  try {
    const { password, email, adminId } = req.body;
    const { success, data } = await adminService.approveAgency(password, email, adminId);
    
    if (success) {
      res.status(200).json({
        message: "Agency approved successfully",
        approvedAgency: data,
      });
    }
  } catch (error) {
    console.error('Error in approveAgencyHandler:', error);
    res.status(500).json({
      message: "Error approving agency",
      error: error.message
    });
  }
});




const removeAgencyHandler = asyncHandler(async (req, res) => {
  const { agencyId } = req.body;
  const result = await adminService.removeAgencyService(agencyId);
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  res.status(200).json(result.message);
});




const banAgencyHandler = asyncHandler(async (req, res) => {
  const { agencyId } = req.body;
  const result = await adminService.banAgencyService(agencyId);
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  res.status(200).json({ message: result.message ,data:result.data});
});





const disableAgencyHandler = asyncHandler(async (req, res) => {
  const { agencyId } = req.body;
  const result = await adminService.disableAgencyService(agencyId);
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  res.status(200).json({ message: result.message ,data:result.data});
});





const grantMaxPowerHandler = asyncHandler(async (req, res) => {
  const { agencyId } = req.body;
  const result = await adminService.grantMaxPowerService(agencyId);
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  res.status(200).json(result.message);
});





const makeAdminHandler = asyncHandler(async (req, res) => {
  const { agencyId } = req.body;
  const result = await adminService.makeAdminService(agencyId);
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  res.status(200).json(result.message);
});




const transferAgencyHandler = asyncHandler(async (req, res) => {
  const { AgencyId, newAgencyId } = req.body;
  const result = await adminService.transferAgencyService(
    AgencyId,
    newAgencyId
  );
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  res.status(200).json(result.message);
});

const getAllAgenciesHandler = asyncHandler(async (req, res) => {
  const agencies = await adminService.getAllAgencies();

  res.status(200).json({
    message: "Get All Agency Fetched Successfully!",
    agencies,
  });
});




// User Manage
const registerUserHandler = asyncHandler(async (req, res) => {
  const userData = req.body;
  const newUser = await adminService.registerUserService(userData);

  res.status(201).json({
    message: "User registered successfully",
    user: newUser,
  });
});




// all Users singInController
const signInHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  try {
    // Call the service to handle the sign-in
    const { user, token } = await adminService.signInService(email, password);

    res.status(200).json({
      message: "Sign-in successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Sign-in error:", error.message); // Log the error for debugging
    res.status(401).json({ message: error.message });
  }
});






const getAllAdminHandler = asyncHandler(async (req, res) => {
  const agencies = await adminService.getAllAdminService();

  res.status(200).json({
    message: "Get All Agency Fetched Successfully!",
    agencies,
  });
});





// How Many Hosts Approve todays


const getApprovedHostsTodayHandler = asyncHandler(async(req,res)=>{
  const approvedHosts = await adminService.getApprovedHostsToday();
  res.status(200).json({
    message:"Host Approved list successfully",
    count:approvedHosts.length,
    approvedHosts
  })

})





const resetPasswordForRoles = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({
      message: 'User ID and role are required'
    });
  }

  try {
    const user = await adminService.resetPasswordForRoles(userId, role);
    res.status(200).json({
      message: 'Password reset successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});



const getPasswordResetRequests = async (req, res) => {
  try {
    const result = await getPasswordResetRequestsService();
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};







router.post("/approve-agency", approveAgencyHandler);
router.delete("/remove-agency", removeAgencyHandler);
router.post("/ban-agency", banAgencyHandler);
router.post("/disable-agency", disableAgencyHandler);
router.post("/grant-max-power", grantMaxPowerHandler);
router.post("/make-admin", makeAdminHandler);
router.post("/transfer-agency", transferAgencyHandler);
router.get("/agencies", getAllAgenciesHandler);
router.post(
  "/userManage",
  authMiddleware,
  roleMiddleware([MASTER_PORTAL, ADMIN]),
  registerUserHandler
);
router.get("/countryPortal-List", getAllAdminHandler);

router.post('/signInAllUsers',signInHandler);
router.get('/getApprovedHostsToday',getApprovedHostsTodayHandler);
router.patch('/reset-password', authMiddleware, roleMiddleware([MASTER_PORTAL, ADMIN]), resetPasswordForRoles)

module.exports = router;
