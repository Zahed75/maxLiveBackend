const RtcTokenBuilder = require('agora-access-token').RtcTokenBuilder;
const RtcRole = require('agora-access-token').RtcRole;

const APP_ID = 'your_agora_app_id'; // Replace with your Agora App ID
const APP_CERTIFICATE = 'your_agora_app_certificate'; // Replace with your Agora App Certificate

const generateAgoraToken = (channelName, uid) => {
  // Define the expiration time of the token
  const expirationTimeInSeconds = 3600;

  // Define the role of the token
  const role = RtcRole.PUBLISHER;

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

module.exports = { generateAgoraToken };
