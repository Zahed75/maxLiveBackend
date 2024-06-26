const mongoose = require("mongoose");

const levelSchema = new mongoose.Schema({
 
  levelName: {
    type: String,
    required: true,
  },
  diamonds: {
    type: Number,
    required: true,
    default: 0,
  },
});

const Level = mongoose.model("Level", levelSchema);

module.exports = Level;
