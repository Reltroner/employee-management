const mongoose = require('mongoose');
const Employee = require('../models/employee');
const User = require('../models/user');

mongoose.connect('mongodb://127.0.0.1/employee-attendance')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Connection error:', err);
  });

async function seedEmployees() {
  try {
    await Employee.deleteMany({});
    console.log('Cleared existing employees');

    const employeeUser = await User.findOne({ username: 'employee1' });
    const managerUser = await User.findOne({ username: 'manager1' });

    if (!employeeUser || !managerUser) {
      throw new Error('Required user not found. Make sure to run user seeder first.');
    }

    const employees = [
      {
        user: employeeUser._id,
        managerId: managerUser._id,
        attendance: [
          {
            date: new Date(),
            status: 'present',
            location: { latitude: -6.2, longitude: 106.8 },
            confirmedByManager: true,
            qrCodeUsed: 'qr-1234',
            managerNote: 'Good punctuality'
          }
        ]
      }
    ];

    await Employee.insertMany(employees);
    console.log('✅ Employee data seeded!');
  } catch (error) {
    console.log('❌ Error during seeding:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedEmployees();
