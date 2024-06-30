const dayjs = require("dayjs");
const { default: mongoose } = require("mongoose");

 const UserSkinsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    skin: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Skin",
    },
    expiresIn: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const generateOTP = () => {
  let digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};

const asyncHandler = (func) => (req, res, next) => {
  Promise.resolve(func(req, res, next)).catch(next);
};

function convertTo4Digit(number) {
  let numStr = String(number);

  let zerosNeeded = 4 - numStr.length;

  for (let i = 0; i < zerosNeeded; i++) {
    numStr = '0' + numStr;
  }

  return numStr;
}


const generateHostId = () => {
  let hostId = '';
  const idLength = 8;
  for (let i = 0; i < idLength; i++) {
    const digit = Math.floor(Math.random() * 10);
    hostId += digit;
  }
  return hostId;
};

const getDurationFromTime = (time, timeType) => {
  const timeNumber = parseInt(time, 10);
  let totalSeconds = 0
  if (timeType === 'short') {
    if (time.includes('d')) {
      totalSeconds = timeNumber * 24 * 60 * 60;
    } else if (time.includes('h')) {
      totalSeconds = timeNumber * 60 * 60

    } else if (time.includes('w')) {
      totalSeconds = timeNumber * 7 * 24 * 60 * 60
    } else if (time.includes('m')) {
      totalSeconds = timeNumber * 60
    }
  } else if (timeType === 'full') {
    if (time.includes('day')) {
      totalSeconds = timeNumber * 24 * 60 * 60;
    } else if (time.includes('hour')) {
      totalSeconds = timeNumber * 60 * 60

    } else if (time.includes('week')) {
      totalSeconds = timeNumber * 7 * 24 * 60 * 60
    } else if (time.includes('minute')) {
      totalSeconds = timeNumber * 60
    } else if (time.includes('month')) {
      totalSeconds = timeNumber * 30 * 24 * 60 * 60
    }
  }
  const timeDuration = dayjs.duration(totalSeconds, "seconds");
  const hours = Math.floor(totalSeconds / 3600).toString();
  const minutes = timeDuration.minutes().toString().padStart(2, '0');
  const seconds = timeDuration.seconds().toString().padStart(2, '0');
  const milliseconds = timeDuration.milliseconds().toString().padStart(6, '0');

  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}
module.exports = {
  generateOTP,
  asyncHandler,
  convertTo4Digit,
  generateHostId,
  getDurationFromTime,
  UserSkinsSchema
};
