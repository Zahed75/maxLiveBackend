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



// deletePostById
const deletePostById=async(id)=>{
    const post = await feedModel.findByIdAndDelete({_id:id});
    if(!post){
        throw new BadRequest("Couldn't Delete Post!")
    }
    return post;
}




//getAllpost Service

// Get all Post all users
const getAllPosts = async () => {
    
        const allPosts = await feedModel.find();
        return allPosts;
    
};





// addComments Service

const addComment=async(postId, userId, comment)=>{
   
        const post = await feedModel.findById(postId);
        if (!post) {
            throw new Error('Posts not found');
        }
        post.comments.push({ UserId: userId, comment: comment });
        await post.save();

        return post;
   
}


// addReply

const addReply = async (postId, commentId, userId, reply) => {
    try {
        const post = await feedModel.findById(postId);
        if (!post) {
            throw new Error('Post not found');
        }

        const comment = post.comments.find(comment => comment._id == commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        comment.replies.push({ UserId: userId, reply: reply }); // Assign UserId field correctly
        await post.save();
        return post;
    } catch (error) {
        throw error;
    }
}





module.exports = {
    createPostService,
    updatePostById,
    deletePostById,
    getAllPosts,
    addComment,
    addReply

}