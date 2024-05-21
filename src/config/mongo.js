// require('dotenv').config();
// const mongoose = require('mongoose');


// // create a connect
// const uri = process.env.MONGODB_URI;

// const connectWithDB = async () => {
//   try {
//     const db = await mongoose.connect(uri);
//     console.log('Connected to Database');
//     return db;
//   } catch (e) {
//     console.log(e);
//     process.exit(1);
//   }
// };

// const disconnectFromDB = () => {
//   return mongoose.connection.close();
// };

// // export them
// module.exports = {
//   connectWithDB,
//   disconnectFromDB,
// };


require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

// Read the MongoDB URI from the secret file if it exists
let uri;
if (process.env.MONGODB_URI_FILE) {
  try {
    uri = fs.readFileSync(process.env.MONGODB_URI_FILE, 'utf8').trim();
  } catch (error) {
    console.error('Error reading MongoDB URI from file:', error);
    process.exit(1);
  }
} else {
  uri = process.env.MONGODB_URI;
}

// Create a connect function
const connectWithDB = async () => {
  try {
    const db = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to Database');
    return db;
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

const disconnectFromDB = () => {
  return mongoose.connection.close();
};

// Export them
module.exports = {
  connectWithDB,
  disconnectFromDB,
};
