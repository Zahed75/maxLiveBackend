const { NameModule } = require("@faker-js/faker");
const mongoose = require("mongoose");

const skinSchema = new mongoose.Schema({
  file: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["ENTRY", "RIDE", "FRAME"],
  },
  name: {
    type: String,
    required: true,
  },
  beans: {
    type: Number,
    required: true,
  },
});

const Skin = mongoose.model("Skin", skinSchema);

module.exports = { Skin };
