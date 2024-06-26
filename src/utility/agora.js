const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const APP_ID = 'dd737f26b0224c57b79b6ba03e702a89'; // Replace with your Agora App ID
const APP_CERTIFICATE = '011484d150b44cc2a803223cacd62692'; // Replace with your Agora App Certificate

const generateAgoraToken = (channelName, uid, role, tokenType, expireTime) => {
  // Calculate privilege expire time
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  // Generate the token based on token type
  let token;
  if (tokenType === 'userAccount') {
    token = RtcTokenBuilder.buildTokenWithAccount(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime
    );
  } else if (tokenType === 'uid') {
    token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpireTime
    );
  } else {
    throw new Error('Invalid token type');
  }

  return token;
};

module.exports = { generateAgoraToken, RtcRole };
