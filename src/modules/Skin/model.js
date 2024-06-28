const { NameModule } = require("@faker-js/faker");
const mongoose = require("mongoose");

const skinSchema = new mongoose.Schema(
  {
    file: {
      type: String,
      required: false,
      default: "",
    },
    type: {
      type: String,
      required: true,
      enum: ["ENTRY", "RIDE", "FRAME"],
    },
    fileType: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    beans: [
      {
        time: String,
        value: Number,
      },
    ],
  },
  {
    versionKey: false,
  }
);

const Skin = mongoose.model("Skin", skinSchema);









module.exports = { Skin };



