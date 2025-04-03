const mongoose = require('mongoose');
const Attendance = require('../models/attendance');
const Employee = require('../models/employee');
const Manager = require('../models/manager'); // ✅ Tambahkan baris ini!
const User = require('../models/user'); // ✅ Tambahkan baris ini!

mongoose.connect('mongodb://127.0.0.1/employee-attendance')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Connection error:', err);
  });

async function seedAttendances() {
  try {
    await Attendance.deleteMany({});
    console.log('Cleared existing attendance records');

    const employee = await Employee.findOne({}).populate('user');
    if (!employee) {
      throw new Error('No employee found. Please run employee seeder first.');
    }

    const attendances = [
      {
        employee: employee._id,
        date: new Date(),
        checkInTime: '08:05',
        checkOutTime: '17:00',
        status: 'Present'
      },
      {
        employee: employee._id,
        date: new Date(new Date().setDate(new Date().getDate() - 1)),
        checkInTime: '08:30',
        checkOutTime: '17:00',
        status: 'Late'
      },
      {
        employee: employee._id,
        date: new Date(new Date().setDate(new Date().getDate() - 2)),
        checkInTime: '-',
        checkOutTime: '-',
        status: 'Absent'
      }
    ];

    await Attendance.insertMany(attendances);
    console.log('✅ Attendance data seeded!');
  } catch (error) {
    console.log('❌ Error during seeding:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedAttendances();
