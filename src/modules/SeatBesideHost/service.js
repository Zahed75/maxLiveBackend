const dayjs = require("dayjs");
const { SeatBesideHost } = require("./model");

const createSeatBesideHostService = async (payload) => {
  const timeNumber = parseInt(payload.time, 10);
  let totalSeconds = 0
  if(payload.time.includes('d')){
   totalSeconds = timeNumber * 24 * 60 * 60;
  }else if(payload.time.includes('h')){
    totalSeconds = timeNumber * 60 * 60
  
  }else if(payload.time.includes('w')){
    totalSeconds = timeNumber * 7 * 24 * 60 * 60
  
  }else if(payload.time.includes('m')){
    totalSeconds = timeNumber * 60
  }
  const timeDuration = dayjs.duration(totalSeconds, "seconds");
  const hours = Math.floor(totalSeconds / 3600).toString();
  const minutes = timeDuration.minutes().toString().padStart(2, '0');
  const seconds = timeDuration.seconds().toString().padStart(2, '0');
  const milliseconds = timeDuration.milliseconds().toString().padStart(6, '0');

  payload.time = `${hours}:${minutes}:${seconds}.${milliseconds}`;
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
  const result = await SeatBesideHost.findByIdAndUpdate(id, { beans: payload.beans });
  return result;
};

module.exports = {
  createSeatBesideHostService,
  getAllSeatBesideHostService,
  updateSeatBesideHostService,
};
