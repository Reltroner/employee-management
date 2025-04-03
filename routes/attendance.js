const express = require('express');
const wrapAsync = require('../utils/wrapAsync');
const router = express.Router({ mergeParams: true });
const attendance = require('../controllers/attendance');
const isAuth = require('../middlewares/isAuth');
const { isAuthor } = require('../middlewares/isAuthor');
const isValidObjectId = require('../middlewares/isValidObjectId');
const { validateAttendance } = require('../middlewares/validator');
const checkRole = require('../middlewares/checkRole');
const QRCode = require('../models/QRCode');
const Employee = require('../models/employee');
const Manager = require('../models/manager');
const User = require('../models/user');
const mongoose = require('mongoose');

// Employee hanya bisa melihat attendance miliknya sendiri
router.get('/', isAuth, wrapAsync(attendance.roleCheck));

// Tambahan: Scan QR untuk absensi
router.post('/scan', isAuth, wrapAsync(attendance.scanQRCode));

// Log absensi harian
router.get('/log', isAuth, checkRole(['Admin', 'Manager']), wrapAsync(attendance.viewLog));

// Riwayat pribadi user
router.get('/history', isAuth, wrapAsync(attendance.userHistory));

router.get('/index', isAuth, attendance.index);
router.post('/', isAuth, validateAttendance, checkRole(['Admin','Manager']), wrapAsync(attendance.createAttendance));
router.get('/create', isAuth, checkRole(['Admin','Manager']), attendance.renderNewForm);

router.get('/:id', isAuth, isValidObjectId('/employees'), attendance.showAttendance);
router.get('/:id/edit', isAuth, isValidObjectId('/employees'), attendance.renderEditForm);
router.put('/:id', isAuth, isValidObjectId('/attendance'), validateAttendance, wrapAsync(attendance.updateAttendance));
router.delete('/:id', isAuth, isValidObjectId('/attendance'), wrapAsync(attendance.deleteAttendance));

// Approval routes for Manager & Admin
router.post('/:userId/approve/:index', isAuth, checkRole(['Manager', 'Admin']), wrapAsync(attendance.approveAttendance));
router.post('/:userId/reject/:index', isAuth, checkRole(['Manager', 'Admin']), wrapAsync(attendance.rejectAttendance));


module.exports = router;
