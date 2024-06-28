const Joi = require("joi");

const liveRoomValidationSchema = Joi.object({
  host_id: Joi.string().required(),
  created_at: Joi.string().required(),
  participants: Joi.array().items(Joi.string()).required(),
});

module.exports = liveRoomValidationSchema;
