const express = require("express");
const router = express.Router();
const hostService = require('./service');
const { asyncHandler } = require("../../utility/common");
const multerMiddleware = require('../../middlewares/multerMiddlware');





const applyToBeHostHandler = asyncHandler(async (req, res) => {
  const agencyId = req.params.agencyId;
  const userId = req.params.userId;
  const hostId = req.params.hostId;
  const hostType = req.body.hostType;
  // const profilePicturePath = req.files['profilePicture'] ? req.files['profilePicture'][0].path : '';
  const nidFrontPath = req.files['nidFront'] ? req.files['nidFront'][0].path : '';
  const nidBackPath = req.files['nidBack'] ? req.files['nidBack'][0].path : '';

  const host = await hostService.applyToBeHostService(
    userId,
    agencyId,
    hostType,
    hostId,
    // profilePicturePath,
    nidFrontPath,
    nidBackPath
  );
  if (!host) {
    res.status(401).json({ message: "Unauthorized to be a host" });
  }
  res.status(200).json({ message: "Sucessfully submitted application", host: host })
});







// delete host Controller
const deleteHostHandler = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const hosts = await hostService.deleteHostService(id, req.body);

  res.status(200).json({
    message: "Host Delete SuccessFully",
    hosts
  })

})
const sendBeansToHostHandler = asyncHandler(async (req, res) => {
  const result = await hostService.sendBeansToHostService( req.body);

  res.status(200).json({
    message: "Beans send successfully",
    result
  })

})





router.post("/applytoBeHost/:userId/:agencyId/:hostId", multerMiddleware.upload.fields([
  { name: 'nidFront', maxCount: 1 },
  { name: 'nidBack', maxCount: 1 }
]), applyToBeHostHandler);
router.post("/sendBeansToHost", sendBeansToHostHandler)
router.delete('/:id', deleteHostHandler)




module.exports = router;