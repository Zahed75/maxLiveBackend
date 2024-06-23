const Joi = require("joi");

const SKINS = {
  FRAME: "FRAME",
  ENTRY: "ENTRY",
  RIDE: "RIDE",
};

const createSkinValidationSchema = Joi.object().keys({
  name: Joi.string().required(),
  beans: Joi.number().required(),
  type: Joi.string().required().valid(SKINS),
});



module.exports = { createSkinValidationSchema };
