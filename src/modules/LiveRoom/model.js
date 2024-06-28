const mongoose = require("mongoose");

const liveRoomSchema = new mongoose.Schema(
  {
    created_at:{
        type : Date,
        required: true
    },
    ended_at:{
        type : Date,
        default: Date.now()
    },
    host_id: {
      type: String,
      required: true,
    },
    participants: {
      type: [String],
      required: true,
      default: 0,
    },
  },
  {
    versionKey: false,
  }

);

const LiveRoom = mongoose.model("LiveRoom", liveRoomSchema);

module.exports = LiveRoom;
