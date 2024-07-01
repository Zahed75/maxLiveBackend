const { asyncHandler } = require("../../utility/common");
const liveRoomServices = require("./service")

const saveLiveRoomHandler = asyncHandler(async (req, res) => {
    const result = await liveRoomServices.saveLiveRoomService(req.body);
    res.status(200).json({
      message: "Live Room Saved successfully",
      result,
    });
  });

module.exports = {saveLiveRoomHandler}