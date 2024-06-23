const express = require("express");
const { createSeatBesideHostHandler , getAllSeatBesideHostHandler , updateSeatBesideHostHandler} = require("./controller");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const { MASTER_PORTAL } = require("../../config/constants");
const router = express.Router();

router.post(
  "/create-beans-per-time",
  // authMiddleware,
  createSeatBesideHostHandler
);

router.get("/beans-per-time",
  // authMiddleware,
   getAllSeatBesideHostHandler);
router.put("/update-beans-per-time/:id", authMiddleware, roleMiddleware([MASTER_PORTAL]), updateSeatBesideHostHandler);

module.exports = router;
