const express = require("express");
const multer = require('multer');
const router = express.Router();
const upload = multer();
const resellerService = require('../Reseller/service');
const { asyncHandler } = require("../../utility/common");
const roleMiddleware = require('../../middlewares/roleMiddleware');
const authMiddleware = require('../../middlewares/authMiddleware');
const {
    AGENCY_OWNER,
    ADMIN,
    MASTER_PORTAL,
    HOST,
    BASIC_USER
  }=require('../../config/constants');
  const { BadRequest } = require("../../utility/errors");
  const { messaging } = require("firebase-admin");
  



  const getCoinsSoldByResellersToday = async (req, res) => {
    
        const totalCoins = await resellerService.getCoinsSoldByResellersToday();
        res.status(200).json({
            message:"Get Total Coins Fetched successfully",
            totalCoins
        }); 
};

  const getSellUpdateGraphHandler = async (req, res) => {
    const { month, year } = req.query;

    if (!month) {
        return res.status(400).json({ message: 'Month is required' });
    }
        const data = await resellerService.getSellUpdateGraphService(parseInt(year), parseInt(month));
        res.status(200).json({
            message:"Reseller coin sell data fetched successfully",
            data
        }); 
};






router.get('/coins-sold-resellers-today',getCoinsSoldByResellersToday)
router.get('/sell-update-graph',getSellUpdateGraphHandler )


module.exports = router;