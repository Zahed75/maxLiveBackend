const mongoose = require("mongoose");

const hostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firebaseUid: {
      type: String,
    },
    firstName: {
      type: String,
      max: [30, "Please Input Your Name"],
      required: function () {
        return this.role === "BU" || "HO";
      },
    },
    lastName: {
      type: String,
      max: [30, "Please Input Your Name"],
      required: function () {
        return this.role === "BU" || "HO";
      },
    },
    userName: {
      type: String,
    },
    birthdate: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "others"],
    },

    email: {
      type: String,
      unique: [true, "your email must be unique/used already"],
      required: [true, "email must be required"],
    },

    password: {
      type: String,
      max: [6, "Your Password must be in 6 digits"],
    },
    profilePicture: {
      type: String,
    },
    hostId: {
      type: String,
      max: [8, "Your host must be less than 8 characters"],
      required: function () {
        return this.role === "HO";
      },
    },
    agencyId: {
      type: String,
    },
    hostType: {
      type: String,
      enum: ["AU", "VD"],
      required: function () {
        return this.role === "HO";
      },
    },

    agencyName: {
      type: String,
      max: [120, "Name Must be at least 120 characters"],
      required: function () {
        return this.role === "HO";
      },
    },
    country: {
      type: String,
      max: [20, "Country must be at least 20 characters"],
    },
    presentAddress: {
      type: String,
      max: [120, "Address must be at least 120 characters"],
    },
    agencyEmail: {
      type: String,
      required: function () {
        return this.role === "HO";
      },
    },

    hostStatus: {
      type: String,
      enum: ['active', 'inactive', 'banned','pending', 'unbanned'], // Add 'banned' to the enum values
      default: 'active'
    },
     
    nidFront: {
      type: String,
      required: function () {
        return this.role === "HO";
      },
    },
    nidBack: {
      type: String,
      required: function () {
        return this.role === "HO";
      }},
    followers: [{ 
      type: mongoose.Schema.Types.ObjectId, ref: "User"
     }],

    otp: {
      type: Number,
    },
    emailChangeOTP: {
      type: Number,
    },
    changedEmail: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
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

    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlock:{
      type:Boolean,
      default:false
    },
    beans: {
      type: Number,
      default: 0,
    },
    diamonds: {
      type: Number,
      default: 0,
    },
    coins:{
      type: Number,
      default: 0,
    },
    star:{
      type: Number,
      default: 0,
    },
    vipStatus: {
      type: Boolean,
      default: false,
    },
    vipLevel: {
      type: Number,
      default: 0,
    },
    frames: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Frame',
    }],
    skins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skin',
    }],
    previousAgency: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency'
      }
    ],
    refreshToken: [String],
  },
  { timestamps: true }
);

const Host = mongoose.model("Host", hostSchema);

module.exports = Host;
