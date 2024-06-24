const { Skin } = require("./model");
const User = require("../User/model");

const getAllSkin = async () => {
  const result = await Skin.find();
  return result;
};
const cloudinary = require("cloudinary").v2;

const createSkinService = async (payload, filePath) => {
  try {
    if (filePath) {
      const cloudinaryResponse = await cloudinary.uploader.upload(filePath);
      payload.file = cloudinaryResponse?.secure_url;
    }
    const result = await Skin.create(payload);
    return result;
  } catch (error) {
    throw error;
  }
};

const sendSkinService = async (payload) => {
  const { user, ...restData } = payload;

  const isUserExists = await User.findOne({ _id: payload.user });
  const isSkinExists = await Skin.findOne({ _id: payload.skin });
  if (!isUserExists) {
    throw new Error("User doest not exists, please check your user id");
  }
  if (!isSkinExists) {
    throw new Error("Skin doest not exists, please check your skin id");
  }
  const isSkinsAlreadySent = isUserExists?.skins.filter(
    (item) => item.skin === payload.skin
  );

  if (isSkinsAlreadySent.length > 0) {
    throw new Error("You sent this skin before");
  }

  try {
    const result = await User.findByIdAndUpdate(
      payload.user,
      {
        $push: {
          skins: restData,
        },
      },
      {
        new: true,
      }
    ).populate({
      path: "skins.skin",
      model: "Skin",
    });
    return result;
  } catch (error) {
    throw error; // Re-throw error for proper handling in controller
  }
};

const deleteSkinService = async (_id) => {
  try {

    const isSkinExist = await Skin.findById(_id);
    
    if (!isSkinExist) {
      throw new Error("Skin does not exist");
    }

    // Delete the skin document
    await Skin.deleteOne({ _id });

    // Remove the skin from all users' skins array
    await User.updateMany(
      { 'skins.skin': _id },
      { $pull: { skins: { skin: _id } } }
    );

    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};


module.exports = { getAllSkin, createSkinService, sendSkinService, deleteSkinService };
