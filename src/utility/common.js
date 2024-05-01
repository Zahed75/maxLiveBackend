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

  
  module.exports = {
    generateOTP,
    asyncHandler,
    convertTo4Digit,
    generateHostId
  };
  