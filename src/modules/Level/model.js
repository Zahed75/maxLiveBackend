const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  currentLevel: {
    type: Number,
    required: true,
    default: 1,
  },
  beansSent: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Level = mongoose.model("Level", levelSchema);

module.exports = Level;
