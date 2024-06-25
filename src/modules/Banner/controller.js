const { asyncHandler } = require("../../utility/common");
const bannerService = require("./service");

const createBannerHandler = async (req, res) => {
  try {
    const { deletedImageIds } = req.body;
    const newImages = req.files.newImages;

    const result = await bannerService.createBannerService(
      newImages,
      deletedImageIds
    );
    res.status(200).json({
      message: "Banner updated successfully",
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBannerHandler,
};
