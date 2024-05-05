const express = require("express");
const router = express.Router();
const hostService = require('./service');
const { asyncHandler } = require("../../utility/common");



const applyToBeHostHandler = asyncHandler(async (req, res) => {
    const agencyId = req.params.agencyId;
    const userId = req.params.userId;
    const hostId = req.params.hostId;
    const hostType = req.body.hostType;
    const host = await hostService.applyToBeHostService(
    userId,
      agencyId,
      hostType,
      hostId
    );
    if (!host) {
      res.status(401).json({ message: "Unauthorized to be a host" });
    }
    res.status(200).json({message:"Sucessfully submitted application",host:host})
  });

  
router.post("/applytoBeHost/:userId/:agencyId/:hostId", applyToBeHostHandler);
  
module.exports = router;