const { SeatBesideHost } = require("./model");

const createSeatBesideHostService = async (payload) => {
  const result = await SeatBesideHost.create(payload);
  return result;
};
const getAllSeatBesideHostService = async () => {
  const result = await SeatBesideHost.find();
  return result;
};

const updateSeatBesideHostService = async (payload, id) => {
  const result = await SeatBesideHost.updateOne({_id: id}, payload);
  return result;
};

module.exports = {
  createSeatBesideHostService,
  getAllSeatBesideHostService,
  updateSeatBesideHostService
};
