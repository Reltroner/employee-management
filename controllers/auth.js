const User = require('../models/user');
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ErrorHandler');

// Render halaman registrasi
module.exports.registerForm = (req, res) => {
    res.render('auth/register');
};

// Proses registrasi pengguna baru
// Proses registrasi pengguna baru
module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password, confirmPassword, role } = req.body;

        // Validasi password == confirmPassword
        if (password !== confirmPassword) {
            req.flash('error_msg', 'Passwords do not match');
            return res.redirect('/auth/register');
        }

        // Jika user yang sedang login (req.user) adalah admin,
        // kita ambil role dari form. Jika tidak, default 'Employee'.
        let finalRole = 'Employee'; // default
        if (req.user && req.user.role === 'Admin' && role) {
            // Hanya admin boleh set role dari form
            finalRole = role;
        }

        // Buat instance user baru
        const user = new User({ 
            username, 
            email, 
            role: finalRole  // set role di sini
        });

        // Daftarkan user dengan Passport-Local-Mongoose
        const registeredUser = await User.register(user, password);

        // Opsional: Jika admin sedang mendaftarkan user lain, 
        // kita tidak perlu auto-login user baru ini. 
        // Mungkin redirect ke /admin/user-list, dsb.
        // Tapi jika user biasa sign-up, kita login otomatis.
        if (req.user && req.user.role === 'Admin') {
            req.flash('success', `User ${registeredUser.username} created successfully as ${finalRole}`);
            return res.redirect('/somewhere'); 
        } else {
            // user biasa sedang self-register
            req.login(registeredUser, (err) => {
                if (err) return next(err);
                req.flash('success', 'Registered successfully and logged in!');
                res.redirect('/home');
            });
        }
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
    // Jika user adalah Admin, arahkan ke /admin/dashboard (atau path khusus Admin)
    if (req.user.role === 'Admin') {
        req.flash('success_msg', 'Welcome, Admin!');
        return res.redirect('/admin/dashboard');
    }else if (req.user.role === 'Manager') {
        req.flash('success_msg', 'Welcome, Manager!');
        return res.redirect('/manager/dashboard');
    }
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
