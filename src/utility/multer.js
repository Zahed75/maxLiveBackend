const multer = require('multer');
const path = require('path');

const feedStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../upload/feeds'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const feedUpload = multer({ storage: feedStorage });

module.exports = {
  feedUpload,
};
