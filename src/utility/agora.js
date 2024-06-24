const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const APP_ID = 'dd737f26b0224c57b79b6ba03e702a89'; // Replace with your Agora App ID
const APP_CERTIFICATE = '011484d150b44cc2a803223cacd62692'; // Replace with your Agora App Certificate

const generateAgoraToken = (channelName, uid, role) => {
  // Define the expiration time of the token
  const expirationTimeInSeconds = 3600;

  // Generate the token
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    expirationTimeInSeconds
  );

  return token;
};

module.exports = { generateAgoraToken, RtcRole };
