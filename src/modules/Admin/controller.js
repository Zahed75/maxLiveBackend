const express = require("express");
const router = express.Router();

const {
  BASIC_USER,
  AGENCY_OWNER,
  MASTER_PORTAL,
  SUPER_ADMIN,
} = require("../../config/constants");

const adminService = require("./service");
const { adminValidate } = require("./request");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const authMiddleware = require("../../middlewares/authMiddleware");
const { asyncHandler } = require("../../utility/common");
const { messaging } = require("firebase-admin");


const approveAgencyHandler = asyncHandler(async (req, res) => {
  const { password, email, adminId } = req.body;

  try {
    const approvedAgency = await adminService.approveAgency(
      password,
      email,
      adminId
    );
    res
      .status(200)
      .json({ message: "Agency approved successfully", approvedAgency });
  } catch (error) {
    res.status(500).json({ message: "Error approving agency" });
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
  res.status(200).json(result.message);
});
const disableAgencyHandler = asyncHandler(async (req, res) => {
  const { agencyId } = req.body;
  const result = await adminService.disableAgencyService(agencyId);
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  res.status(200).json(result.message);
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

router.post("/approve-agency", approveAgencyHandler);
router.delete("/remove-agency", removeAgencyHandler);
router.post("/ban-agency", banAgencyHandler);
router.post("/disable-agency", disableAgencyHandler);
router.post("/grant-max-power", grantMaxPowerHandler);
router.post("/make-admin", makeAdminHandler);
router.post("/transfer-agency", transferAgencyHandler);

module.exports = router;
