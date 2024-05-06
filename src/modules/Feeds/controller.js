const express = require('express');
const router = express.Router();

const feedService=require('./service');
const User = require('../User/model');
const { ObjectId } = require('mongoose').Types;
const {
    BASIC_USER, 
    AGENCY_OWNER,
    MASTER_PORTAL,
    SUPER_ADMIN,
    COIN_RESLLER,
    BEAN_RESELLER
   
   }=require('../../config/constants');

const authService = require('../Auth/service');
const { adminValidate } = require('./request');
const roleMiddleware = require('../../middlewares/roleMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const {asyncHandler}=require('../../utility/common');
const feedModel=require('../Feeds/model');
const UserModel = require('../User/model');


// CreatePostHandler

const createPostHandler = asyncHandler(async(req,res)=>{
    const posts = await feedService.createPostService(req.body);
    res.status(200).json({
        message:"Post created successfully",
        posts
    })
})



// updatePostByUserId

const updatePostHandler=asyncHandler(async(req,res)=>{
    const {id}=req.params;
    const updatePost=await feedService.updatePostById(id,req.body);
    res.status(200).json({
        message:"Post Updated Successfully",
        updatePost
    })
})





router.post('/addPost',createPostHandler);
router.put('/:id',updatePostHandler);

module.exports=router;


