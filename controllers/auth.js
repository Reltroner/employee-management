const User = require('../models/user');
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ErrorHandler');

// Render halaman registrasi
module.exports.registerForm = (req, res) => {
    res.render('auth/register');
};

// Proses registrasi pengguna baru
module.exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });

        // Daftarkan user dengan Passport-Local-Mongoose
        const registeredUser = await User.register(user, password);
        
        // Login otomatis setelah registrasi
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash('success', 'Register successfully');
            res.redirect('/home');
        });
    } catch (e) {
        req.flash('error_msg', e.message);
        res.redirect('/auth/register');
    }
};

// Render halaman login
module.exports.loginForm = (req, res) => {
    res.render('auth/login');
};

// Proses login dengan Passport.js
module.exports.login = (req, res) => {
    req.flash('success_msg', 'Login successfully');
    res.redirect('/index');
}

// Proses logout
module.exports.logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) {return next(err);}
        req.flash('success', 'You have logged out successfully.');
        res.redirect('/auth/login');
    });
};
