const { Skin } = require("./model");

const getAllFrameSkin = async () => {
  const result = await Skin.find();
  return result;
};
const cloudinary = require('cloudinary').v2;

const createSkinService = async (payload, filePath) => {
  try {
    if (filePath) {
      const cloudinaryResponse = await cloudinary.uploader.upload(filePath);
        payload.file = cloudinaryResponse?.secure_url;
    }
    const result = await Skin.create(payload);
    return result;
  } catch (error) {
    throw error; // Re-throw error for proper handling in controller
  }
};

module.exports = { getAllFrameSkin, createSkinService };
