const express = require('express');
const router = express.Router();
const passport = require('passport');
const auth = require('../controllers/auth');
const wrapAsync = require('../utils/wrapAsync');

router.route('/register')
    .get(auth.registerForm)
    .post(wrapAsync(auth.register));

router.get('/register', (req, res) => {
    res.render('auth/register', { title: 'Register - Employee Management System' });
});

router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Login - Employee Management System' });
});
   
router.route('/login')
    .get(auth.loginForm)
    .post(passport.authenticate('local', {failureFlash: { 
    type: 'error_msg', message: 'Invalid username or password'},
    failureRedirect: '/login',}), auth.login);

router.get('/logout', auth.logout);

module.exports = router;
