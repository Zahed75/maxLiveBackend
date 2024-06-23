const { NameModule } = require("@faker-js/faker");
const mongoose = require("mongoose");

const seatBesideHostSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
  },
  beans: {
    type: Number,
    required: true,
  },
  
},
{ versionKey: false }
);
  
const SeatBesideHost = mongoose.model("seatBesideHost", seatBesideHostSchema);

module.exports = { SeatBesideHost };
