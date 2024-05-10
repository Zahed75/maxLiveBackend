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
const mongoose = require('mongoose');

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


// deletePostHandler

const deletePostByIdHandler = asyncHandler(async(req,res)=>{

    const  {id}=req.params;
    const posts= await feedService.deletePostById(id,req.body);
    res.status(200).json({
        message:"Post deleted successfully",
        posts
    })

})


// getAllPostsController
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const getAllPostsHandler = asyncHandler(async(req,res)=>{
    const allPosts = await feedService.getAllPosts();

        if (allPosts.length === 0) {
            return res.status(404).json({ message: "No posts found" });
        }

        const shuffledPosts = shuffleArray(allPosts);
        const randomPosts = shuffledPosts.filter((post, index) => index % 2 === 0);
        res.status(200).json({
            message:"GetALLPost Fetched SuccessFully!",
            randomPosts
        })
})



//addComment Handler

const addCommentHandler=asyncHandler(async(req,res)=>{
    const { userId, comment } = req.body;
    const postId = req.params.postId;

    const posts = await feedService.addComment(postId, userId, comment);

    res.status(201).json({ message: 'Comment added successfully', posts });
})



// addReply Handler
const addReplyHandler = asyncHandler(async(req, res) => {
    const { postId, commentId } = req.params;
    const { userId, reply } = req.body;
   
    
    try {
        const posts = await feedService.addReply(postId, commentId, userId, reply);
        res.status(201).json({ message: 'Reply added successfully', posts });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})


// likes Handler
const likePostHandler = async (req, res) => {
    try {
        const { userId } = req.body;
        const postId = req.params.postId;

        const updatedLikes = await feedService.likePost(postId, userId);

        res.status(200).json({ message: 'Post liked successfully', likes: updatedLikes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



//getTotal LikesHandler

const getTotalLikesHandler=async(req, res)=>{
    {
        try {
            const postId = req.params.postId;
    
            const likesCount = await feedService.getTotalLikes(postId);
    
            res.status(200).json({ likes: likesCount });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}




// addFollowers

const followUserHandler = async (req, res) => {
    try {
      const { followerId, followingId } = req.body;
  
      const result = await feedService.followUser(followerId, followingId);
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message }); // Use specific error messages
    }
  };



// GetTotal Followers
const getTotalFollowers = async (req, res) => {
    try {
        const { userId } = req.params; // Extract userId from request parameters

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid userId format' });
        }

        const totalFollowers = await feedService.getTotalFollowers(userId);

        res.status(200).json(totalFollowers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};





//Following Users

const getTotalFollowing=async(req, res)=>{
    {
        try {
            const userId = req.params.userId;
            const totalFollowing = await feedService.getTotalFollowing(userId);
            res.status(200).json({ totalFollowing });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}



const getTotalPostsByUserIdHandler = async (req, res) => {
    try {
        const { userId } = req.params; // Assuming userId is passed as a URL parameter
        const totalPosts = await feedService.getTotalPostsByUserId(userId);
        res.json({ totalPosts });
    } catch (error) {
        console.error('Error getting total posts by user ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



//SharePost
const sharePostHandler = async (req, res) => {
    try {
        const { postId } = req.params; // Extract postId from request parameters
        const { userId } = req.body; // Extract userId from request body

        // Call the service function to share the post
        const sharedPost = await feedService.sharePost(postId, userId);

        res.status(200).json({ message: 'Post shared successfully', sharedPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};








router.post('/addPost',createPostHandler);
router.put('/:id',updatePostHandler);
router.delete('/:id',deletePostByIdHandler);
router.get('/allPosts',getAllPostsHandler)
router.post('/addComments/:postId',addCommentHandler);
router.post('/addReply/:postId/:commentId',addReplyHandler);
router.post('/likePost/:postId', likePostHandler);
router.get('/likesTotal/:postId', getTotalLikesHandler);
router.post('/follow', followUserHandler);
router.get('/followers/:userId', getTotalFollowers);
router.get('/following/:userId', getTotalFollowing);
router.get('/:userId/totalPost',getTotalPostsByUserIdHandler);
router.post('/share/:postId', sharePostHandler);

module.exports=router;


