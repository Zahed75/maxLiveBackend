const LiveRoom = require("./model");

const createLiveRoomService = async (payload) => {
  const result = await LiveRoom.create(payload);
  return result;
};

module.exports = { createLiveRoomService };
