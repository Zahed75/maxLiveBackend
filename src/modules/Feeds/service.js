const feedModel=require('../Feeds/model');
const multer = require('multer');
const { BadRequest, NotFound } = require('../../utility/errors');
const User=require('../User/model');
const mongoose = require('mongoose');




// create a post

const createPostService= async(posts)=>{
    const newPost=await feedModel.create(posts);
    return newPost;
}





//updatePostById

const updatePostById=async(id,value)=>{
    const post=await feedModel.findByIdAndUpdate({_id:id},value,{
        new:true,
    });

    if(!post){
        throw new BadRequest("Couldn't Update the Post! Try Again")
    }

    return post;
}





module.exports = {
    createPostService,
    updatePostById

}