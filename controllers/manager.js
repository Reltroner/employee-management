// controllers/manager.js
const User = require('../models/user');
const Employee = require('../models/employee');
const Manager = require('../models/manager');

module.exports.index = async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const regex = new RegExp(searchQuery, 'i');

    const managers = await User.find({
      role: 'Manager',
      $or: [
        { username: regex },
        { email: regex },
        { 'profile.name': regex },
        { 'profile.department': regex },
        { 'profile.position': regex }
      ]
    });

    res.render('manager/index', { managers, searchQuery });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load managers.');
    res.redirect('/dashboard');
  }
};

module.exports.managerDashboard = async (req, res) => {
    try {
      const managerUserId = req.user._id;
      const user = await User.findById(managerUserId);
  
      // Ambil data manager dan tim
      const manager = await Manager.findOne({ user: managerUserId }).populate({
        path: 'team',
        populate: {
          path: 'user',
          model: 'User'
        }
      });
  
      // Ambil kehadiran hari ini dari tim
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      const teamAttendance = [];
  
      for (let emp of manager.team) {
        const attendanceToday = emp.attendance.find(record => {
          const recordDate = new Date(record.date);
          return recordDate.toDateString() === today.toDateString();
        });
        teamAttendance.push({ employee: emp, attendance: attendanceToday });
      }
  
      res.render('dashboard/manager', {
        user,
        teamAttendance
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Failed to load manager dashboard.');
      res.redirect('/dashboard');
    }
  };
