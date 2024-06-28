const agencyModel = require("../Agency/model");
const User = require("../User/model");
const Host = require("../Host/model");
const { NotFound, BadRequest } = require("../../utility/errors");
const { asyncHandler } = require("../../utility/common");
const mongoose = require('mongoose');
const Bean = require('../Bean/model'); // Adjust this path as necessary






const getCoinsSoldByResellersToday = async () => {
  try {
    const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayData = await Bean.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
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
        _id: null, 
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0, 
        totalAmount: 1,
      },
    },
  ]);

  if (todayData.length > 0) {
    return todayData[0].totalAmount
  } else {
    return 0 
  }
  } catch (error) {
    console.error("Error fetching coins sold by resellers per month:", error);
    throw new Error('Internal server error');
  }
};


// --------------------
const getSellUpdateGraphService = async (year, monthNumber) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(year, monthNumber - 1, 1);
    const endOfMonth = new Date(year, monthNumber, 0);
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
  getCoinsSoldByResellersToday,
  getSellUpdateGraphService
}