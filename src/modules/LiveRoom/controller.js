const { asyncHandler } = require("../../utility/common");
const liveRoomServices = require("./service")

const createLiveRoomHandler = asyncHandler(async (req, res) => {
    const result = await liveRoomServices.createLiveRoomService(req.body);
    res.status(200).json({
      message: "Live Room Created successfully",
      result,
    });
  });

module.exports = {createLiveRoomHandler}