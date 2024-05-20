const feedModel=require('../Feeds/model');
const multer = require('multer');
const { BadRequest, NotFound } = require('../../utility/errors');
const User=require('../User/model');
const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fsExtra = require('fs-extra');
// Function to save image data to file system and return the image URL
require('dotenv').config(); // Import dotenv to access environment variables
const BASE_URL = process.env.BASE_API_URL; // Access base URL from environment variable




// create a post

// const createPostService= async(posts)=>{
//     const newPost=await feedModel.create(posts);
//     return newPost;
// }




// Define the directory where images will be saved
const UPLOADS_DIR = path.join(__dirname, 'uploads'); // Adjusted path to remove redundant 'Feeds' directory

const saveImage = async (base64Image) => {
    if (!base64Image) {
        throw new Error('Base64 image data is required');
    }

    const matches = base64Image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 image string');
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const imageType = matches[1].split('/')[1]; // e.g., 'jpeg', 'png'
    const imageName = `${uuidv4()}.${imageType}`;
    const imagePath = path.join(UPLOADS_DIR, imageName);

    // Ensure the uploads directory exists
    await fsExtra.ensureDir(UPLOADS_DIR);

    // Save the image to the file system
    await fs.promises.writeFile(imagePath, imageBuffer);

    // Generate the image URL using the base URL from .env
    const imageUrl = `${BASE_URL}/uploads/${imageName}`;
    return imageUrl;
};


// Function to create a new post
const createPostService = async ({ userId, base64Image, caption }) => {
    // Check if user exists
    // Replace this with your own user retrieval logic
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Save the image and get the image URL
    const imageUrl = await saveImage(base64Image);

    // Create the post
    const newPost = await feedModel.create({ userId, fileUrl: imageUrl, caption });

    return newPost;
};





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






// Get all Post all users
const getAllPosts = async () => {
    const allPosts = await feedModel.find().populate({
        path: 'userId',
        select: 'firstName,profilePicture'
      });
    return allPosts;
  };




 
// addComments Service

const addComment = async (postId, userId, comment) => {
    const post = await feedModel.findById(postId);
    if (!post) {
        throw new Error('Post not found');
    }
    post.comments.push({ userId: userId, comment: comment });
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

        comment.replies.push({ userId: userId, reply: reply }); // Corrected field name to userId
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


// followUser

const followUser = async (followerId, followingId) => {
    try {
      // Update User model
      const follower = await User.findByIdAndUpdate(followerId, {
        $addToSet: { following: followingId },
      }, { new: true }); // Ensures updated document is returned
  
      if (!follower) {
        throw new Error('Follower not found');
      }
  
      await follower.save(); // Explicitly save follower document
  
      const following = await User.findByIdAndUpdate(followingId, {
        $addToSet: { followers: followerId },
      }, { new: true });
  
      if (!following) {
        throw new Error('Following user not found');
      }
  
      await following.save(); // Explicitly save following document
  
      // Update Post model (for following user's posts)
      const followingPosts = await feedModel.updateMany({ userId: followingId }, {
        $addToSet: { followers: followerId }
      });
      if (followingPosts.nModified === 0) {
        console.warn('No posts found for following user');
      }
  
      // Update Post model (for follower user's posts)
      const followerPosts = await feedModel.updateMany({ userId: followerId }, {
        $addToSet: { following: followingId }
      });
      if (followerPosts.nModified === 0) {
        console.warn('No posts found for follower user');
      }
  
      return { message: 'User followed successfully' };
    } catch (error) {
      console.error(error);
      if (error.name === 'MongoError') { // Check for specific database errors
        throw new Error('Failed to update user data');
      } else {
        throw new Error('Failed to create following relationship');
      }
    }
  };






// getTotalFollowers byUserId

const getTotalFollowers = async (userId) => {
    try {
        // Query user data
        const user = await User.findOne({ _id: userId });
        if (!user) {
          throw new Error('User not found');
        }
    
        // Query feed data associated with the user
        const feeds = await feedModel.find({ userId });
    
        return { user, feeds };
      } catch (error) {
        console.error('Error fetching user and feeds:', error.message);
        throw error; // Re-throw the error for higher level handling
      }
};




//getTotal Following 

const getTotalFollowing = async (userId) => {
    try {
        const user = await User.findById(userId).populate('following');
        if (!user) {
            throw new Error('User not found');
        }

        return user.following.length;
    } catch (error) {
        throw new Error(error.message);
    }
}


// getTotalPostCound

const getTotalPostsByUserId=async(userId)=>{
    try {
        const totalPosts = await feedModel.countDocuments({ userId });
        return totalPosts;
    } catch (error) {
        throw error;
    }
}


const sharePost = async (postId, userId) => {
    try {
        // Find the post to be shared
        const postToShare = await feedModel.findById(postId);
        if (!postToShare) {
            throw new Error('Post not found');
        }

        // Increment shares count of the shared post
        postToShare.shares++;

        // Save the updated post
        await postToShare.save();

        // Create a new post for the user who shares it
        const sharedPost = new feedModel({
            userId: userId,
            shares: 0, // Initialize shares count for the new post
            // Copy necessary fields from the original post
            files: postToShare.files,
            likes: postToShare.likes,
            fileUrl: postToShare.fileUrl,
            verse: postToShare.verse,
            caption: postToShare.caption,
            comments: postToShare.comments // Assuming comments should also be copied
        });

        // Save the new shared post
        await sharedPost.save();

        return sharedPost;
    } catch (error) {
        throw new Error(error.message);
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
    followUser,
    getTotalFollowers,
    getTotalFollowing,
    getTotalPostsByUserId,
    sharePost
}