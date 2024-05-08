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



// add Like Post
const likePost = async (postId, userId) => {
    try {
        const posts = await feedModel.findById(postId);
        if (!posts) {
            throw new Error('Upload not found');
        }

        if (posts.likes.includes(userId)) {
            throw new Error('You have already liked this post');
        }

        posts.likes.push(userId);
        await posts.save();

        // Returning updated likes array
        return posts.likes;
    } catch (error) {
        throw new Error(error.message);
    }
}




//getTotal Like of a POST

const getTotalLikes=async(postId)=>{
    {
        try {
            const posts = await feedModel.findById(postId);
            if (!posts) {
                throw new Error('Posts not found');
            }
    
            return posts.likes.length;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}






module.exports = {
    createPostService,
    updatePostById,
    deletePostById,
    getAllPosts,
    addComment,
    addReply,
    likePost,
    getTotalLikes,

}