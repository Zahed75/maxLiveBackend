const mongoose = require("mongoose");

const vipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vipLevel: {
    type: Number,
    required: true,
  },
  perks: {
    type: [String],
    required: true,
  },
  activatedAt: {
    type: Date,
    default: Date.now,
  },
});

const VIP = mongoose.model("VIP", vipSchema);

module.exports = VIP;
