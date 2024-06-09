const agencyModel = require("../Agency/model");
const User = require("../User/model");
const Host = require("../Host/model");
const { NotFound, BadRequest } = require("../../utility/errors");
const { asyncHandler } = require("../../utility/common");
const mongoose = require('mongoose');
const Bean = require('../Bean/model'); // Adjust this path as necessary






const getCoinsSoldByResellersPerMonth = async (year, month) => {
    try {
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        const resellers = await User.aggregate([
            {
                $match: {
                    role: "BR",
                    createdAt: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalCoins: { $sum: "$coins" }
                }
            }
        ]);

        const totalCoins = resellers.length > 0 ? resellers[0].totalCoins : 0;
        return totalCoins;
    } catch (error) {
        console.error("Error fetching coins sold by resellers per month:", error);
        throw new Error('Internal server error');
    }
};








module.exports = {
    getCoinsSoldByResellersPerMonth,
    
}