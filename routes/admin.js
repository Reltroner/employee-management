// routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Model User
const isAuth = require('../middlewares/isAuth');
const checkRole = require('../middlewares/checkRole');
const wrapAsync = require('../utils/wrapAsync');

// Render form untuk Admin create user baru
router.get('/create-user', 
  isAuth, 
  checkRole(['Admin']), 
  (req, res) => {
    // Pastikan Anda memiliki view ejs misalnya 'admin/createUser.ejs'
    res.render('admin/createUser', { title: 'Create New User' });
});

// Proses pembuatan user baru oleh Admin
router.post('/create-user', 
  isAuth, 
  checkRole(['Admin']), 
  wrapAsync(async (req, res) => {
    try {
      const { username, email, role, password } = req.body;

      // Pastikan 'role' termasuk di antara ['Admin', 'Manager', 'Employee']
      if (!['Admin', 'Manager', 'Employee'].includes(role)) {
        req.flash('error', 'Invalid role selected');
        return res.redirect('/admin/create-user');
      }

      // Membuat user baru dengan Passport-Local-Mongoose
      const newUser = new User({ username, email, role });
      const registeredUser = await User.register(newUser, password);

      req.flash('success', `User ${registeredUser.username} created successfully!`);
      res.redirect('/dashboard'); // arahkan sesuai kebutuhan Anda
    } catch (err) {
      console.error('Error creating user:', err);
      req.flash('error', err.message);
      res.redirect('/admin/create-user');
    }
}));

router.get('/dashboard', isAuth, checkRole(['Admin']), (req, res) => {
    res.render('admin/dashboard', { title: 'Admin Dashboard' });
  });

module.exports = router;
