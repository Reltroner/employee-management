const Joi = require('joi');

module.exports.attendanceSchema = Joi.object({
    employee: Joi.string().required().messages({
        'string.empty': 'Employee ID is required.',
        'any.required': 'Employee ID is required.'
    }),
    date: Joi.date().required().messages({
        'date.base': 'Invalid date format.',
        'any.required': 'Date is required.'
    }),
    status: Joi.string().valid('Present', 'Absent', 'Late').required().messages({
        'any.only': 'Status must be either Present, Absent, or Late.',
        'any.required': 'Attendance status is required.'
    }),
    checkInTime: Joi.string().required().messages({
        'string.empty': 'Check-in time cannot be empty.'
    }),
    checkOutTime: Joi.string().allow(null, '').optional().messages({
        
    })
});
