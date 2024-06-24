const { asyncHandler } = require("../../utility/common");
const {
  getAllSkin,
  sendSkinService,
  createSkinService,
  deleteSkinService,
} = require("./service");

const getAllSkinsHandler = asyncHandler(async (req, res) => {
  const result = await getAllSkin();
  return res
    .status(201)
    .json({ message: "Skins Retrieved successfully", result });
});

const createSkinHandler = asyncHandler(async (req, res) => {
  const file = req.files["file"] ? req.files["file"][0] : null;
  const filePath = file ? file.path : "";
  const fileType = file ? file.mimetype : req.body.fileType;

  const payload = {
    ...req.body,
    fileType: fileType
  };

  const result = await createSkinService(payload, filePath);
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
  const id = req.params.id;
  const result = await deleteSkinService(id);
  res.status(200).json({
    message: "Skin deleted successfully",
    result,
  });
});

module.exports = {
  deleteSkinsHandler,
  sendSkinHandler,
  createSkinHandler,
  getAllSkinsHandler,
};
