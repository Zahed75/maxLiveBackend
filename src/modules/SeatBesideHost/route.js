const express = require("express");
const { createSeatBesideHostHandler , getAllSeatBesideHostHandler ,clearHotSeatHandler,bookHotSeatHandler, updateSeatBesideHostHandler} = require("./controller");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const { MASTER_PORTAL } = require("../../config/constants");
const router = express.Router();

router.post(
  "/create-beans-per-time",
  // authMiddleware,
  createSeatBesideHostHandler
);
router.post(
  "/book-hot-seat",
  // authMiddleware,
  bookHotSeatHandler
);
router.put(
  "/clear-hot-seat",
  // authMiddleware,
  clearHotSeatHandler
);

router.get("/beans-per-time",
  // authMiddleware,
   getAllSeatBesideHostHandler);
router.put("/update-beans-per-time/:id", authMiddleware, roleMiddleware([MASTER_PORTAL]), updateSeatBesideHostHandler);

module.exports = router;
