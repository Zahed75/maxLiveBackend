const bcrypt = require('bcryptjs');
const { required, version } = require('joi');
const mongoose = require('mongoose');



const adminSchema = new mongoose.Schema({


    carousel: {
        type : String,
        required: false,
        
    },
    carouselLink:{
        type : String,
        required: false,
    }


},{versionKey:false})

  
const adminModel = mongoose.model('admin', adminSchema);
  
module.exports = adminModel;
