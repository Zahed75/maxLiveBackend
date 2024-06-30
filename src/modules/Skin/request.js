const Joi = require("joi");

const SKINS = {
  FRAME: "FRAME",
  ENTRY: "ENTRY",
  RIDE: "RIDE",
};

const beans = Joi.object().keys({
  time: Joi.string().required(),
  value: Joi.number().required()
});



const createSkinValidationSchema = Joi.object().keys({
  name: Joi.string().required(),
  beans: Joi.array().ordered(beans),
  type: Joi.string().required().valid(SKINS),
});



module.exports = { createSkinValidationSchema };
