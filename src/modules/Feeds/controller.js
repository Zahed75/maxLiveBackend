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