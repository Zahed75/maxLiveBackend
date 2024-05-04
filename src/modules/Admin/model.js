const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    userRef: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    name: {
        type: String,
        required: true,
        maxlength: 255 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        maxlength: 255, 
    },
    password: {
        type: String,
        required: true,
        minlength: 6, 
        maxlength: 255 
    },
    phone: {
        type: String,
        required: true,
        maxlength: 20 
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
    carousel: {
        type: String,
        maxlength: 255 
    },
    carouselLink: {
        type: String,
        maxlength: 255 
    },
    goldBeans: {
        type: Number,
        default: 0
    },
    diamond: {
        type: Number,
        default: 0
    }
}, { versionKey: false });


adminSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

const adminModel = mongoose.model('Admin', adminSchema);

module.exports = adminModel;
