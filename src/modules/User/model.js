const bcrypt = require("bcryptjs");
const { required } = require("joi");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: String,
    firstName: {
      type: String,
      max: [30, "Please input your name"],
      required: function () {
        return this.role === "BU" || this.role === "HO";
      },
    },
    lastName: {
      type: String,
      max: [30, "Please input your name"],
      required: function () {
        return this.role === "BU" || this.role === "HO";
      },
    },
    userName: String,

    birthdate: String,
    gender: {
      type: String,
      enum: ['male', 'female', 'others']
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    password: {
      type: String,
      max: [6, "Your password must be at least 6 characters"],
    },
    profilePicture: {
      type: String,
      
    },
    hostId: {
      type: String,
      max: [8, "Your host ID must be less than 8 characters"],
      required: function () {
        return this.role === "HO";
      },
    },
    agencyId: String,
    hostType: {
      type: String,
      enum: ["AU", "VD"],
      required: function () {
        return this.role === "HO";
      },
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
      },
    },
    agencyName: {
      type: String,
      max: [120, "Agency name must be at most 120 characters"],
      required: function () {
        return this.role === "AG";
      },
    },
    country: {
      type: String,
      max: [20, "Country must be at most 20 characters"],
    },
    presentAddress: {
      type: String,
      max: [120, "Address must be at most 120 characters"],
    },
    agencyEmail: {
      type: String,
      required: function () {
        return this.role === "AG";
      },
    },
    previousAppName: {
      type: String,
      max: [20, "App name must be at most 20 characters"],
    },
    activeHost: {
      type: String,
      max: [23, "Host must be at most 23 characters"],
    },
    monthlyTarget: {
      type: String,
      max: [120, "Target must be at most 120 characters"],
    },
    referenceBy: {
      type: String,
      max: [20, "Reference must be at most 20 characters"],
    },

    isApproved: {
      type: Boolean,
      default: false
    },

    hostStatus: {
      type: String,
      enum: ["active","inactive","pending","rejected"],
      default: "inactive",
    },
    
    otp: Number,

    emailChangeOTP: Number,

    changedEmail: String,

    isActive: {
      type: Boolean,
      default: false,
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

    isVerified: {
      type: Boolean,
      default: false,
    },
    

    // ...Skins/Frame/Level/Coins/Beans...
    beans: { 
      type: Number,
       default: 0 
      },
    diamonds: {
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
    posts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feed'
    }],
    refreshToken: [String],
  },
  
  { timestamps: true }
);

UserSchema.pre("save", async function hashPassword(next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods = {
  async authenticate(password) {
    return await bcrypt.compare(password, this.password);
  },
};

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
