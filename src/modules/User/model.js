const bcrypt = require("bcryptjs");
const { required, string } = require("joi");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
    },
    firstName: {
      type: String,
      max: [30, "Please Input Your Name"],
      required: function () {
        return this.role === "BU"||"HO";
      },
    },
    lastName: {
      type: String,
      max: [30, "Please Input Your Name"],
      required: function () {
        return this.role === "BU"||"HO";
      },
    },
    userName:{
      type : String
    },
    birthdate:{
      type : String
    },
    gender:{
      type : String,
      enum:['male','female','others']
    },

    email: {
      type: String,
      unique: [true, "your email must be unique/used already"],
      required: [true, "email must be required"],
    },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
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
    agencyId: 
      {
        type: String,
      },

    hostType: {
      type: String,
      enum: ["AU", "VD"],
      required: function () {
        return this.role === "HO";
      },
    },

    userNid: {
      type: [String],
    },

    agencyName: {
      type: String,
      max: [120, "Name Must be at least 120 characters"],
      required: function () {
        return this.role === "AG";
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
        return this.role === "AG";
      },
    },

    // agencyNumber: {
    //   type: String,
    //   max: [12, "Phone Number must be less then 13 characters"],
    //   required: function () {
    //     return this.role === "AG";
    //   },
    // },
    previousAppName: {
      type: String,
      max: [20, "App Name must be at least 20 characters"],
    },
    activeHost: {
      type: String,
      max: [23, "Host must be at least 23 characters"],
    },

    monthlyTarget: {
      type: String,
      max: [120, "Target must be at least 20 characters"],
    },

    referenceBy: {
      type: String,
      max: [20, "Reference must be at least 20 characters"],
    },

    agencyNid: {
      type: [String],
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
    hostStatus :{
      type : String,
      enum : ["None","Pending","Accepted"],
      default : "None"
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

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
    refreshToken: [String],
  },
  { timestamps: true }
);

// Password Hash Function using Bycryptjs

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

// //Validations
// UserSchema.path("agencyNumber").validate(function (value) {
//   const regex = /^\d{13}$/; // regular expression to match 11 digits
//   return regex.test(value);
// }, "Must be a valid phone number");

const UserModel = mongoose.model("user", UserSchema);

module.exports = UserModel;
