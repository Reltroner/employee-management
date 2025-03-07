module.exports = (err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong!' } = err;
    res.status(statusCode);
    res.render('layouts/error', { error: err });
};
