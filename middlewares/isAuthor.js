const Employee = require('../models/employee');
const ExpressError = require('../utils/ErrorHandler');

module.exports = async (req, res, next) => {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
        throw new ExpressError('Employee Not Found', 404);
    }

    if (!employee.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/employees/${id}`);
    }

    next();
};
