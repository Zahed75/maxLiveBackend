const express = require("express");
const { asyncHandler } = require("../../utility/common");
const multerMiddleware = require("../../middlewares/multerMiddlware");
const { getAllSkin, sendSkinService, createSkinService, deleteSkinService } = require("./service");
const { SkinValidate, createSkinValidationSchema } = require("./request");
const handleValidation = require("../../middlewares/schemaValidation");

const router = express.Router();

const getAllSkinsHandler = asyncHandler(async (req, res) => {
  const result = await getAllSkin();
  return res
    .status(201)
    .json({ message: "Skins Retrieved successfully", result });
});

const createSkinHandler = asyncHandler(async (req, res) => {
  const skinUrl = req.files["file"] ? req.files["file"][0].path : "";
  const result = await createSkinService(req.body, skinUrl);
  res.status(200).json({
    message: "Skin Created successfully",
    result,
  });
});

const sendSkinHandler = asyncHandler(async (req, res) => {
  const result = await sendSkinService(req.body);
  res.status(200).json({
    message: "Skin sent successfully",
    result,
  });
});

const deleteSkinsHandler = asyncHandler(async (req, res) => {
  const result = await deleteSkinService({id:req.params.id});
  res.status(200).json({
    message: "Skin deleted successfully",
    result,
  });
});

router.get("/", getAllSkinsHandler);
router.put("/delete-skin/:id", deleteSkinsHandler);
router.post(
  "/create-skin",
  // handleValidation(createSkinValidationSchema),
  multerMiddleware.upload.fields([{ name: "file", maxCount: 1 }]),
  createSkinHandler
);

router.put("/send-skin", sendSkinHandler);

module.exports = router;
