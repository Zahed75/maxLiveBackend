const mongoose = require("mongoose");

const beanSchema = new mongoose.Schema({
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

const Bean = mongoose.model("Bean", beanSchema);

module.exports = Bean;
