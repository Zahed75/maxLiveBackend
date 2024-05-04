const { required } = require("joi");
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
    enum: ["BD", "NEP", "IND"], 

  },
  role: {
    type: String,
    // BU -> Basic User
    // HO -> Host
    // AG ->Agency Owner
    // MP -> Master Portal
    // AD -> Admin
    //CN ->Coin Resller
    //BR -> Bean Reseller

    enum: ["BU", "HO", "AG", "MP", "AD", "CN", "BR"],
    require: [true, "Role must be selected"],
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
    type: [String],
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
});

const Agency = mongoose.model("Agency", agencySchema);

module.exports = Agency;
