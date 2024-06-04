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
