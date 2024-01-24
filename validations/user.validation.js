const Joi = require("joi");

exports.validateLoginInput = function (input) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(input);
}

exports.validateRegisterInput = (input) => {
  const schema = Joi.object({
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(5).max(255).required(),
    email: Joi.string().min(5).max(255).required().email(),
  });

  return schema.validate(input);
}