// routes/dashboard.js
const express = require('express');
const router = express.Router();
const isAuth = require('../middlewares/isAuth');
const checkRole = require('../middlewares/checkRole');
const dashboard = require('../controllers/dashboard');

// Redirect user based on role after login
router.get('/', isAuth, (req, res) => {
  const role = req.user.role;
  if (role === 'Admin') return res.redirect('/dashboard/admin');
  if (role === 'Manager') return res.redirect('/dashboard/manager');
  return res.redirect('/dashboard/employee');
});

router.get('/admin', isAuth, checkRole(['Admin']), dashboard.adminDashboard);
router.get('/manager', isAuth, checkRole(['Manager']), dashboard.managerDashboard);
router.get('/employee', isAuth, checkRole(['Employee']), dashboard.employeeDashboard);

module.exports = router;
