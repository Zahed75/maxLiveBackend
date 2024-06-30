const express = require("express");
const { getAllSkinsHandler, createSkinHandler, sendSkinHandler, deleteSkinsHandler, buySkinHandler } = require("./controller");
const multerMiddleware = require("../../middlewares/multerMiddlware");
const router = express.Router();


router.get("/", getAllSkinsHandler);
router.put("/delete-skin/:id", deleteSkinsHandler);
router.post(
  "/create-skin",
  // handleValidation(createSkinValidationSchema),
  multerMiddleware.upload.fields([{ name: "file", maxCount: 1 }]),
  createSkinHandler
);

router.put("/send-skin", sendSkinHandler);
router.post("/buy-skin", buySkinHandler);

module.exports = router;