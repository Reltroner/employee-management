// controllers/dashboard.js
const QRCodeLib = require('qrcode');
const generateDailyQR = require('../utils/generateDailyQR');
const User = require('../models/user');
const Employee = require('../models/employee');
const QRCode = require('../models/QRCode');

module.exports.dashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/login');
    }

    let qrImage = null;
    if (user.role === 'Admin' || user.role === 'Manager') {
      const qrData = await generateDailyQR(user._id, user.role);
      qrImage = await QRCodeLib.toDataURL(qrData.code);
    }

    res.render('dashboard/index', {
      user,
      qrImage
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load dashboard.');
    res.redirect('/login');
  }
};

module.exports.employeeDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw new Error('User not found');

    const employee = await Employee.findOne({ user: user._id });
    if (!employee) throw new Error('Employee profile not found');

    // Ambil absensi hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = employee.attendance.find(att => new Date(att.date).toDateString() === today.toDateString());

    // Ambil 5 riwayat absensi terakhir
    const sortedAttendance = [...employee.attendance].sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentAttendance = sortedAttendance.slice(0, 5);

    // Ambil QR code yang masih aktif hari ini
    const activeQRCode = await QRCode.findOne({
      role: 'Employee',
      expiresAt: { $gte: new Date() }
    });

    res.render('dashboard/employee', {
      user,
      employee,
      todayAttendance,
      recentAttendance,
      activeQRCode
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load employee dashboard.');
    res.redirect('/dashboard');
  }
};

module.exports.managerDashboard = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const employees = await Employee.find({ managerId: user._id }).populate('user');
  
      // Ambil kehadiran hari ini untuk tim
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const teamAttendance = employees.map(emp => {
        const todayRecord = emp.attendance.find(att => new Date(att.date).toDateString() === today.toDateString());
        return { employee: emp, attendance: todayRecord };
      });
  
      res.render('dashboard/manager', {
        user,
        teamAttendance
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Failed to load manager dashboard');
      res.redirect('/');
    }
  };
  

module.exports.adminDashboard = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      const totalUsers = await User.countDocuments();
      const totalManagers = await User.countDocuments({ role: 'Manager' });
      const totalEmployees = await User.countDocuments({ role: 'Employee' });
  
      res.render('dashboard/admin', {
        user,
        totalUsers,
        totalManagers,
        totalEmployees
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Failed to load admin dashboard');
      res.redirect('/');
    }
  };
  
