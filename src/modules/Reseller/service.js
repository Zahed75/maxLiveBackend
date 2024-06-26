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


// --------------------
const getSellUpdateGraphService = async (monthNumber) => {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), monthNumber - 1, 1);
      const endOfMonth = new Date(today.getFullYear(), monthNumber, 0);
      const pipeline = [
        {
            $match: {
              createdAt: {
                $gte: startOfMonth,
                $lte: endOfMonth,
              },
            },
          },
          {
            $lookup: {
              from: 'users', 
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: '$user',
          },
          {
            $match: {
              'user.role': 'BR',
            },
          },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            totalAmount: { $sum: '$amount' }
          }
        }
      ];
  
      const graphData = await Bean.aggregate(pipeline);
      const formattedGraphData = formatGraphData(graphData, startOfMonth, today);
      return formattedGraphData;
    } catch (error) {
      console.error('Error fetching graph data:', error);
      throw new Error('Internal server error');
    }
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
};
  
  const formatGraphData = (graphData, startOfMonth, endOfMonth) => {
    const formattedData = [];
    let currentDate = new Date(startOfMonth);
  
    while (currentDate <= endOfMonth) {
      const dateString = formatDate(currentDate);
      const graphItem = graphData.find(item => item._id === dateString);
      if (graphItem) {
        formattedData.push({
          date: dateString,
          totalAmount: graphItem.totalAmount
        });
      } else {
        formattedData.push({
          date: dateString,
          totalAmount: 0
        });
      }
  
      currentDate.setDate(currentDate.getDate() + 1); 
    }
  
    return formattedData;
  };
//   ---------------



module.exports = {
    getCoinsSoldByResellersPerMonth,
    getSellUpdateGraphService
}