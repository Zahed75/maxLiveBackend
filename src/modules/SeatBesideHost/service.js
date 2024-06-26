const { SeatBesideHost } = require("./model");

const createSeatBesideHostService = async (payload) => {
  const isSkinExistsWithSameTimeAndBeans = await SeatBesideHost.findOne({
    time: payload.time,
  });
  let result;

  if (isSkinExistsWithSameTimeAndBeans) {
    result = await SeatBesideHost.updateOne(
      {
        time: payload.time,
      },
      { beans: Number(payload.beans) }
    );
  } else {
    result = await SeatBesideHost.create(payload);
  }

  return result;
};
const getAllSeatBesideHostService = async () => {
  const result = await SeatBesideHost.find();
  return result;
};

const updateSeatBesideHostService = async (payload, id) => {
  const result = await SeatBesideHost.findByIdAndUpdate(id, {beans: payload.beans});
  return result;
};

module.exports = {
  createSeatBesideHostService,
  getAllSeatBesideHostService,
  updateSeatBesideHostService,
};
