// joi/user.js
const Joi = require('joi');

const userValidationSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),

  confirmPassword: Joi.any().valid(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Passwords do not match' }),

  role: Joi.string().valid('Admin', 'Manager', 'Employee').default('Employee'),

  name: Joi.string().min(2).max(100).required(),

  phone: Joi.string().pattern(/^[0-9+()\-\s]{7,20}$/).required(),

  department: Joi.string().required(),

  position: Joi.string().required(),

  address: Joi.string().allow('', null),

  status: Joi.string().valid('Active', 'Inactive').default('Active')
});

module.exports = userValidationSchema;
