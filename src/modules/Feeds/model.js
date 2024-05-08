const mongoose = require('mongoose');
const User = require('../User/model');

const ReplySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  reply: {
    type: String,
    required: true,
    max: [500, 'Reply must be less than 500 characters']
  }
}, { timestamps: true });

const CommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  comment: {
    type: String,
    required: true,
    max: [500, 'Comment must be less than 500 characters']
  },
  replies: [ReplySchema]
}, { timestamps: true });

const FeedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  files: String,
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  fileUrl: String,
  shares: {
    type: Number,
    default: 0
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  caption: {
    type: String,
    max: [1000, 'Caption must be less than 1000 characters']
  },
  comments: [CommentSchema]
}, { timestamps: true });

const FeedModel = mongoose.model('Feed', FeedSchema);

module.exports = FeedModel;
