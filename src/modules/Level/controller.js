const express = require("express");
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const { MASTER_PORTAL } = require("../../config/constants");
const router = express.Router();


const { asyncHandler } = require("../../utility/common");

const {createLevelService, getAllLevelService, updateLevelService} = require('./service')


const createLevelHandler = asyncHandler(async (req, res) => {
  const result = await createLevelService(req.body);
  res.status(200).json({
    message: "Diamonds/level Created successfully",
    result,
  });
});

const getAllLevelHandler = asyncHandler(async (req, res) => {
  const result = await getAllLevelService();
  res.status(200).json({
    message: "Diamonds/level Retrieved successfully",
    result,
  });
});

const updateLevelHandler = asyncHandler(async (req, res) => {
  const result = await updateLevelService(req.body, req.params.id);
  res.status(200).json({
    message: "Diamonds/level updated successfully",
    result,
  });
});


module.exports = {
    createLevelHandler,
    getAllLevelHandler,
    updateLevelHandler
}

router.post(
  "/create-level",
  // authMiddleware,
  createLevelHandler
);

router.get("/levels",
  // authMiddleware,
   getAllLevelHandler);
router.put("/update-level/:id", updateLevelHandler);

module.exports = router;
