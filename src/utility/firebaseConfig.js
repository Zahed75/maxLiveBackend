const admin = require('firebase-admin');
const serviceAccount = require('./maxlive-c8947-firebase-adminsdk-cnvfh-9e931f15cc.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firebase = {
  admin,
  getUserById: async (userId) => {
    try {
      const userRecord = await admin.auth().getUser(userId);
      return userRecord.toJSON();
    } catch (error) {
      throw new Error('User not found');
    }
  },
  getRoomById: async (roomId) => {
    try {
      const roomDoc = await admin.firestore().collection('live_rooms').doc(roomId).get();
      if (!roomDoc.exists) {
        throw new Error('Room not found');
      }
      return { id: roomDoc.id, ...roomDoc.data() };
    } catch (error) {
      throw new Error('Error retrieving room');
    }
  }
};

module.exports = firebase;