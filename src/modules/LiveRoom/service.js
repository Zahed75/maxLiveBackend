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

  const durationMs = dayjs().diff(dayjs(payload.created_at));
  // Format duration as HH:mm:ss.SSSSSS
  const durationFormatted = dayjs
    .duration(durationMs)
    .format("HH:mm:ss.SSSSSS");
  console.log(durationFormatted, durationMs);
  payload.duration = durationFormatted;
  console.log(payload);
  payload.host_id = host._id;
  host.diamonds += payload.diamondsReward;

  host.save();
  const result = await LiveRoom.create(payload);
  return result;
};

module.exports = { saveLiveRoomService };
