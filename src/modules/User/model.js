const bcrypt = require('bcryptjs');
const { required } = require('joi');
const mongoose = require('mongoose');


const UserSchema=new mongoose.Schema({
    firstName:{
    type:String,
     max:[30,'Please Input Your Name'],
    required:[true,'Must Be required your name']
    },
    lastName:{
      type:String,
       max:[30,'Please Input Your Name'],
      required:[true,'Must Be required your name']
      },
  
    email: {
        type: String,
        unique: [true, 'your email must be unique/used already'],
        required: [true, 'email must be required'],
      },

      password: {
        type: String,
        max: [6, 'Your Password must be in 6 digits'],
        
      },
      profilePicture:{
        type: String,
        
      },
      hostId:{
        type: String,
        unique: [true, 'your host must be unique'],
        max:[8,'Your host must be less than 8 characters'],
    
      },
      agencyId:[
        {
          type:mongoose.Schema.Types.ObjectId,
          ref:'agency'
        }
      ],
    
      hostType:{
        type:String,
        enum:['AU','VD'],
        required:[true,'Type Must be selected']
      },
    
      hostNid:{
        type:[String]
      },

      agencyName:{
        type:String,
        max:[120,'Name Must be at least 120 characters']
      },
     country:{
        type:String,
        max:[20,'Country must be at least 20 characters']
     },
     presentAddress:{
        type:String,
        max:[120,'Address must be at least 120 characters']
     },
     agencyEmail:{
      type:String,
      unique:true,
      required: [true, 'email must be required'],
     },

     agencyNumber:{
        type:String,
        max:[12,'Phone Number must be less then 13 characters'],
        required:[true,'Must input Phone Number']
     },
     previousAppName:{
      type:String,
      max:[20,'App Name must be at least 20 characters'],

     },
     activeHost:{
        type:String,
        max:[23,'Host must be at least 23 characters'],
    
     },

      monthlyTarget:{
        type:String,
        max:[120,'Target must be at least 20 characters']
      },

      referenceBy:{
        type:String,
        max:[20,'Reference must be at least 20 characters']
      },

      agencyNid:{
        type:[String]
      },

      isApproved:{
        type:Boolean,
        default:false
      },
      followers:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],

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

        enum: ['BU','HO','AG','MP','AD','CN','BR'],
        require: [true, 'Role must be selected'],
      },

      isVerified: {
        type: Boolean,
        default: false,
      },
      refreshToken: [String],

      
},{ timestamps: true }
);



// Password Hash Function using Bycryptjs

UserSchema.pre('save', async function hashPassword(next) {
    if (this.isModified('password')) {
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

  
  //Validations
  UserSchema.path('agencyNumber').validate(function (value) {
    const regex = /^\d{13}$/; // regular expression to match 11 digits
    return regex.test(value);
  }, 'Must be a valid phone number');
  

  
  const UserModel = mongoose.model('user', UserSchema);
  
  module.exports = UserModel;
