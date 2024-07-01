const Host = require("../Host/model");
const LiveRoom = require("./model");

const saveLiveRoomService = async (payload) => {
  const host = await Host.findById(payload.host_id);
  host.diamonds += payload.diamondsReward
  host.save()
  const result = await LiveRoom.create(payload);
  return result;
};

module.exports = { saveLiveRoomService };
