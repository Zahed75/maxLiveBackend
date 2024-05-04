const express = require("express");
const router = express.Router();
const hostService = require('./service');
const { asyncHandler } = require("../../utility/common");



const applyToBeHostHandler = asyncHandler(async (req, res) => {
    const agencyId = req.params.agencyId;
    const hostType = req.body.hostType;
    const userId = req.params.userId;
    const hostId = await hostService.applyToBeHostService(
    userId,
      agencyId,
      hostType,
    );
    if (!hostId) {
      res.status(401).json({ message: "Unauthorized to be a host" });
    }
    res.status(201).json({ message: "successful", hostId });
  });

  
router.post("/applytoBeHost/:userId/:agencyId", applyToBeHostHandler);
  
module.exports = router;