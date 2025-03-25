// seed.js (contoh)
const mongoose = require('mongoose');
const User = require('../models/user');

(async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1/employee-attendance', {
      useNewUrlParser: true, 
      useUnifiedTopology: true
    });
    console.log('Database connected');

    // Cek kalau belum ada user Admin
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      // Buat user Admin default
      const admin = new User({ username: 'admin', email: 'admin@example.com', role: 'Admin' });
      const registeredAdmin = await User.register(admin, 'admin123');
      console.log('Default admin created:', registeredAdmin);
    } else {
      console.log('Admin already exists. No action taken.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
