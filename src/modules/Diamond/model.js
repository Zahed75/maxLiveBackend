const mongoose = require("mongoose");

const diamondSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionType: {
    type: String,
    enum: ["receive", "convert"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Diamond = mongoose.model("Diamond", diamondSchema);

module.exports = Diamond;
