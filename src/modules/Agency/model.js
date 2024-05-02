const mongoose = require("mongoose");

const agencySchema = new mongoose.Schema({
  agencyName: {
    type: String,
    required: [true, "Agency name is required"],
  },
  agencyHolderName: {
    type: String,
    required: [true, "Agency holder name is required"],
  },
  country: {
    type: String,
    enum: ["BD", "IND", "PAK"], // Add all countries as enum values
    required: [true, "Country is required"],
  },
  presentAddress: {
    type: String,
    required: [true, "Present address is required"],
  },
  permanentAddress: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
  },
  previousAppName: {
    type: String,
  },
  activeHost: {
    type: String,
  },
  monthlyTarget: {
    type: String,
  },
  referenceBy: {
    type: String,
  },
  nidPhoto: {
    type: [String]
  },
});

const Agency = mongoose.model("Agency", agencySchema);

module.exports = Agency;
