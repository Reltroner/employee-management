const { employeeSchema } = require('../schemas/employee');
const { attendanceSchema } = require('../schemas/attendance');
const ExpressError = require('../utils/ErrorHandler');

module.exports.validateEmployee = (req, res, next) => {
    const { error } = employeeSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
};

module.exports.validateAttendance = (req, res, next) => {
    const { error } = attendanceSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
};
