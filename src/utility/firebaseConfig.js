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
  }
};

module.exports = firebase;