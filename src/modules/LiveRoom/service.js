const { NotFound } = require("../../utility/errors");
const Host = require("../Host/model");
const LiveRoom = require("./model");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(utc);
dayjs.extend(customParseFormat);

const saveLiveRoomService = async (payload) => {
  const host = await Host.findById(payload.host_id);
  if (!host) {
    throw new NotFound("Host not found");
  }
  payload.created_at = dayjs(
    payload.created_at,
    "MMMM DD, YYYY [at] h:mm:ss A z"
  )
    .utc()
    .format("YYYY-MM-DDTHH:mm:ss.SSSZ");

  const durationMs = new Date() - new Date(payload.created_at);
  const durationObj = dayjs.duration(durationMs);

  const durationFormatted = `${String(durationObj.days() * 24 + durationObj.hours()).padStart(2, '0')}:${String(durationObj.minutes()).padStart(2, '0')}:${String(durationObj.seconds()).padStart(2, '0')}.${String(durationObj.milliseconds()).padStart(3, '0')}`;
  payload.duration = durationFormatted;
  payload.host_id = host._id;
  host.diamonds += payload.diamondsReward;
  host.save();
  const result = await LiveRoom.create(payload);
  return result;
};

module.exports = { saveLiveRoomService };
