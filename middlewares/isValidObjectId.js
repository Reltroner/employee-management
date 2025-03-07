const mongoose = require('mongoose');
const ExpressError = require('../utils/ErrorHandler');

module.exports = (redirectUrl = '/employees') => {
    return (req, res, next) => {
        const paramId = ['id', 'employeeId'].find(param => req.params[param]);
        if (!paramId) {
            req.flash('error', 'Invalid ID');
            return res.redirect(redirectUrl);
        }
        const id = req.params[paramId];
        if (!mongoose.Types.ObjectId.isValid(id)) {
            req.flash('error', 'Invalid ID');
            return res.redirect(redirectUrl);
        }
        next();
    }
}