const User = require("../User/model");
const Host = require('../Host/model');
const Agency = require("../Agency/model");
const { generateHostId } = require("../../utility/common");
const { NotFound,BadRequest,Unauthorized } = require("../../utility/errors");

const generateMaxId = require('../../utility/maxId'); 
const firebase = require("../../utility/firebaseConfig");


const applyToBeHostService = async (
  userId,
  agencyId,
  hostType,
  hostId,
  nidFrontPath,
  nidBackPath
) => {
  try {
    // Find the user in the User model
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if the agency exists
    const agency = await Agency.findOne({ agencyId: agencyId });
    if (!agency) {
      throw new Error("Agency not found");
    }
    // Generate maxId
    const maxId = generateMaxId();
    // Update the user's host status to "Pending"
    user.hostStatus = "pending";
    user.hostType = hostType;
    user.hostId = hostId;
    user.agencyId = agencyId;
    user.isActive = user.isActive;
    user.isVerified = user.isVerified;
    user.isApproved = user.isApproved;
    user.profilePicture = user.profilePicture;
    maxId, 
    user.nidFront = nidFrontPath;
    user.nidBack = nidBackPath;
    await user.save();

    return user;
  } catch (error) {
    console.error("Error applying to be host:", error);
    throw error;
  }
};





// delete Host service

const deleteHostService = async (id)=>{
  
  const hostUsers = Host.findByIdAndDelete({_id:id});
  if(!hostUsers){
    throw new NotFound("Host not found")
  }
  return hostUsers;

}
const sendBeansToHostService = async (payload)=>{
  const {hostId, beans, userId, roomId} = payload
  const host = await Host.findById(hostId);
  const user = await User.findById(userId)
  const room = await firebase.getRoomById(roomId);
  const roomRef = firebase.admin
  .firestore()
  .collection("live_rooms")
  .doc(roomId);

  if(!host){
    throw new NotFound("Host not found")
  }
  if(!user){
    throw new NotFound("User not found")
  }
  if(!room){
    throw new NotFound("Room not found")
  }
  if(user.beans < beans){
    throw new Error("Insufficient beans")
  }
  if(0 > beans){
    throw new Error("Beans must be a positive number")
  }
  if(!room.diamondsReward){
    room.diamondsReward = 0
  }
  const updatedRoom = {
    ...room,
    diamondsReward: room.diamondsReward + beans
  };
  user.beans -= beans;
  user.save()
  await roomRef.set(updatedRoom, { merge: true });
  return room;
}




module.exports = {

   applyToBeHostService,
   deleteHostService,
   sendBeansToHostService
};
