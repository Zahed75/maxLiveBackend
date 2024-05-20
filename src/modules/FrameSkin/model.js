const mongoose = require("mongoose");

const frameSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  frameUrl: {
    type: String,
    required: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

const Frame = mongoose.model("Frame", frameSchema);

const skinSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  skinUrl: {
    type: String,
    required: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

const Skin = mongoose.model("Skin", skinSchema);

module.exports = { Frame, Skin };
