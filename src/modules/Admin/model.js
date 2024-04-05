const bcrypt = require('bcryptjs');
const { required, version } = require('joi');
const mongoose = require('mongoose');



const adminSchema = new mongoose.Schema({
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },

    carousel: {
        type : String,
    },
    carouselLink:{
        type : String,
    },

    goldBeans:{
        type:Number,
        default:0
    },
    diamond:{
        type:Number,
        default:0
    },
    

},{versionKey:false})

  
const adminModel = mongoose.model('admin', adminSchema);
  
module.exports = adminModel;
