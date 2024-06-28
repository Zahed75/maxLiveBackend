const express = require("express");
const liveRoomControllers = require("./controller");
const handleValidation = require("../../middlewares/schemaValidation");
const liveRoomValidationSchema = require("./request");
const router = express.Router();


router.post(
  "/save-live-room",
  handleValidation((body) => liveRoomValidationSchema.validate(body)),
  liveRoomControllers.createLiveRoomHandler
);


module.exports = router;