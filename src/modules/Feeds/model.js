const bcrypt=require('bcryptjs');
const mongoose=require('mongoose');
const User=require('../User/model');
const { required } = require('joi');

const ReplySchema=new mongoose.Schema({
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    reply:{
        type:String,
        required:true,
        max:[500,'Reply Must be less than 500 characters']
    }
},{timestamps:true});

// Commments schema

const CommentSchema=new mongoose.Schema({
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    comment:{
        type:String,
        required:true,
        max:[500,'Comment Must be less than 500 characters']
    },
    replies:[ReplySchema]
   
    

},{timestamps:true});

// Define The Uploads Schema
const UploadSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"user"
    },
    files:{
        type:String,
        required:false
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }],

    fileUrl:{
        type:String,
        required:false,

    },
    shares:{
        type:Number,
        default:0
    },
    following:{
        type:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
        default:[],
    },
    followers:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    caption:{
        type:String,
        max:[1000,'Your Caption Must be at least 1000 Characters']
    },
    comments:[CommentSchema]
},{timestamps:true});