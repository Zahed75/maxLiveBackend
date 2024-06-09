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
  



  const getCoinsSoldByResellersPerMonth = async (req, res) => {
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).json({ message: 'Year and month are required' });
    }
        const totalCoins = await resellerService.getCoinsSoldByResellersPerMonth(parseInt(year), parseInt(month));
        res.status(200).json({
            message:"Get Total Coins Fetched successfully",
            totalCoins
        }); 
};






router.get('/coins-sold-resellers-per-month',getCoinsSoldByResellersPerMonth)


module.exports = router;