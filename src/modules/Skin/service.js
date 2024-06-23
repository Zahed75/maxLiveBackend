const { Skin } = require("./model");
const  User  = require("../User/model");

const getAllSkin = async () => {
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

const sendSkinService = async (payload) => {

    const isUserExists = await User.findOne({_id: payload.user});
    const isSkinExists = await Skin.findOne({_id: payload.skin});
    if(!isUserExists){
      throw new Error("User doest not exists, please check your user id")
    }
    if(!isSkinExists){
      throw new Error("Skin doest not exists, please check your skin id")
    }
    const isSkinsAlreadySent = isUserExists?.skins.filter((item)=> item.skin === payload.skin);

    if(isSkinsAlreadySent.length> 0){
      throw new Error("You sent this skin before")
    }


  try {
  const result =  await User.findByIdAndUpdate(
      payload.user ,
      {
        $push: {
          skins: payload,
        },
      },
      {
        new: true
      }
    )
    .populate({
      path: "skins.skin",
      model: "Skin"
    });
    return result;
  } catch (error) {
    throw error; // Re-throw error for proper handling in controller
  }
};

module.exports = { getAllSkin, createSkinService, sendSkinService };
