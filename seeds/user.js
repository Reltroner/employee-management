const mongoose = require('mongoose');
const User = require('../models/user');

// Koneksi ke database
mongoose.connect('mongodb://127.0.0.1/employee-attendance')
  .then(() => {
    console.log('🌱 Connected to MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });

const seedUser = async () => {
  try {
    await User.deleteMany({});
    console.log('🧹 Cleared existing users');

    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'Admin',
        profile: {
          name: 'Administrator',
          phone: '081234567890',
          department: 'IT',
          position: 'System Admin',
          address: 'Head Office',
          status: 'Active'
        }
      },
      {
        username: 'manager1',
        email: 'manager1@example.com',
        password: 'manager123',
        role: 'Manager',
        profile: {
          name: 'Manager Satu',
          phone: '081122334455',
          department: 'Operations',
          position: 'Branch Manager',
          address: 'Branch Office',
          status: 'Active'
        }
      },
      {
        username: 'employee1',
        email: 'employee1@example.com',
        password: 'employee123',
        role: 'Employee',
        profile: {
          name: 'Employee Pertama',
          phone: '089998887777',
          department: 'HR',
          position: 'Staff HR',
          address: 'Remote',
          status: 'Active'
        }
      }
    ];

    for (const data of users) {
      const { username, email, password, role, profile } = data;
      const user = new User({ username, email, role, profile });
      await User.register(user, password);
      console.log(`✅ Seeded: ${username} (${role})`);
    }

    await mongoose.connection.close();
    console.log('✅ Seeding done & MongoDB connection closed');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    await mongoose.connection.close();
    console.log('⚠️ Connection closed after error');
  }
};

seedUser();
