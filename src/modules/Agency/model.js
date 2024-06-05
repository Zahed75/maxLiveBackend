const { required, ref } = require("joi");
const mongoose = require("mongoose");

const agencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "User id is required"],
    unique: true,
  },
  agencyId:{
    type : String,
    max :[30,"agencyId should be under 30 characters"],
    required: [true, "Agency id is required"]
  },
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
    // BU -> BASIC USER
    // HO -> HOST
    //AG-AGENCY 
    //MP -> MASTER PORTAL
    // AD -> ADMIN
    //CN - COIN 
    // BR -BEAN RESELLER
    enum: ["BU", "HO", "AG", "MP", "AD", "CN", "BR"],
    required: true,
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
  password:{
    type:String,
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
  nidPhotos: [
    {
      type: {
        type: String,
        enum: ["front", "back"], // Enum for photo type: front or back
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }
  ],
  agencyStatus:{
    type:String,
    enum:["active","inactive","pending","banned"],
    default:"pending"
  },
  isActive:{
    type:Boolean,
    default:false
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  maxPower:{
    type:Boolean,
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
