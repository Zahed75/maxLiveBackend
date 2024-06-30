const { Skin } = require("./model");
const User = require("../User/model");
const { NotFound } = require("../../utility/errors");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");
const Host = require("../Host/model");
const Agency = require("../Agency/model");
const { getDurationFromTime } = require("../../utility/common");
const { default: mongoose } = require("mongoose");
dayjs.extend(duration);
const ObjectId = mongoose.Types.ObjectId;
const getAllSkin = async () => {
  const result = await Skin.find();
  return result;
};
const cloudinary = require("cloudinary").v2;

const createSkinService = async (payload, filePath) => {
  console.log(payload);
  payload.beans = JSON.parse(payload.beans);

  try {
    if (!filePath) {
      throw new Error("Please add media to create skin");
    }

    let file = "";
    if (payload.fileType.startsWith("image/")) {
      if (!filePath) {
        throw new Error("Image file is required");
      }
      const cloudinaryResponse = await cloudinary.uploader.upload(filePath);
      file = cloudinaryResponse?.secure_url;
    } else if (payload.fileType.startsWith("video/")) {
      const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
        resource_type: "video",
      });
      file = cloudinaryResponse?.secure_url;
    }

    payload.file = file;

    const result = await Skin.create(payload);
    return result;
  } catch (error) {
    throw error;
  }
};

const sendSkinService = async (payload) => {
  
  const { user, ...restData } = payload;
  let isUserExists = await User.findOne({ maxId: payload.user });
  if (!isUserExists) {
    isUserExists = await Host.findOne({ maxId: user })
  }
  if (!isUserExists) {
    isUserExists = await Agency.findOne({ maxId: user })
  }
  const isSkinExists = await Skin.findOne({ _id: payload.skin });
  if (!isUserExists) {
    throw new NotFound("User not found");
  }
  if (!isSkinExists) {
    throw new NotFound("Skin not found");
  }
  const isSkinsAlreadySent = isUserExists?.skins.find(
    (item) => item.skin === payload.skin
  );

  if (isSkinsAlreadySent) {
    throw new Error("You sent this skin before");
  }

  try {

    const days = parseInt(payload.expiresIn, 10);
    const totalSeconds = days * 24 * 60 * 60; // Convert days to seconds

    const timeDuration = dayjs.duration(totalSeconds, "seconds");
    const hours = Math.floor(totalSeconds / 3600).toString();
    const minutes = timeDuration.minutes().toString().padStart(2, '0');
    const seconds = timeDuration.seconds().toString().padStart(2, '0');
    const milliseconds = timeDuration.milliseconds().toString().padStart(6, '0');

    restData.expiresIn = `${hours}:${minutes}:${seconds}.${milliseconds}`;

    const result = await (isUserExists.role === 'AG' ? Agency : isUserExists.role === 'HO' ? Host : User).findOneAndUpdate(
      { maxId: payload.user },
      {
        $push: {
          skins: { skin: restData.skin, expiresIn: restData.expiresIn },
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
const buySkinService = async (payload) => {
  const { user, skinId, expiresIn } = payload;
  let isUserExists = await User.findOne({ maxId: user });
  const isSkinExists = await Skin.findById(skinId);
  if (!isUserExists) {
    isUserExists = await Host.findOne({ maxId: user })
  }
  if (!isUserExists) {
    isUserExists = await Agency.findOne({ maxId: user })
  }
  if (!isUserExists) {
    throw new NotFound("User not found");
  }
  if (!isSkinExists) {
    throw new NotFound("Skin not found");
  }
  if (!expiresIn) {
    throw new Error("Expire time is required")
  }
  const isSkinsAlreadyBuy = isUserExists?.skins.filter(
    (item) => item.skin.toString() === skinId
  );

  if (isSkinsAlreadyBuy.length > 0) {
    throw new Error("You bought this skin already");
  }
  // const expiresInTime = isSkinExists.beans.find(item => getDurationFromTime(item.time, 'full')  === expiresIn)
  const expiresInTime = isSkinExists.beans.find(item => item.time  === expiresIn)
  if(expiresInTime.value > isUserExists.beans){
    throw new Error("Insufficient beans")
  }
  try {
    const result = await (isUserExists.role === 'AG' ? Agency : isUserExists.role === 'HO' ? Host : User).findOneAndUpdate(
      { maxId: payload.user },
      {
        $push: {
          skins: { skin: skinId, expiresIn },
        },
        $inc: {
          beans: - expiresInTime.value, // assuming payload.beansDecrement is the value you want to decrement beans by
        },
      },
      {
        new: true,
      },

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
      { "skins.skin": _id },
      { $pull: { skins: { skin: _id } } }
    );

    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  getAllSkin,
  createSkinService,
  sendSkinService,
  deleteSkinService,
  buySkinService
};
