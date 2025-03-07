const Joi = require('joi');

module.exports.employeeSchema = Joi.object({
    name: Joi.string().min(1).max(50).required(),
    email: Joi.string().email().min(1).max(50).required(),
    phone: Joi.string().pattern(/^[0-9]+$/).min(5).max(15).required(),
    position: Joi.string().min(1).max(50).required(),
    department: Joi.string().min(1).max(50).required(),
    address: Joi.string().required(),
    status: Joi.string().valid('Active', 'Inactive').required()
});
