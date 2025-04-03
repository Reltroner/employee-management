// routes/manager.js
const express = require('express');
const router = express.Router();
const managerController = require('../controllers/manager');
const isAuth = require('../middlewares/isAuth');
const checkRole = require('../middlewares/checkRole');
const attendanceController = require('../controllers/attendance');

// Manager Dashboard (optional if needed)
router.get('/dashboard/manager', isAuth, checkRole(['Manager']), managerController.managerDashboard);

// Attendance Log View for Managers
router.get('/attendance/log', isAuth, checkRole(['Manager']), attendanceController.viewLog);

router.get('/', isAuth, checkRole(['Admin']), managerController.index);

module.exports = router;
