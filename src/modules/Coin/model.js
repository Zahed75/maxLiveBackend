const mongoose = require("mongoose");

const coinSchema = new mongoose.Schema({
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
    enum: ["purchase", "send", "convert"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CoinModel = mongoose.model("Coin", coinSchema);

module.exports = CoinModel;
