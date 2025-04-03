// controllers/admin.js
const User = require('../models/user'); // Model User
const Employee = require('../models/employee');
const wrapAsync = require('../utils/wrapAsync');
const QRCodeModel = require('../models/QRCode');
const QRCodeLib = require('qrcode');
const crypto = require('crypto');

// Dashboard Admin
module.exports.renderAdminDashboard = (req, res) => {
  res.render('dashboard/admin', { title: 'Admin Dashboard' });
};

/* ================================
   USER MANAGEMENT CONTROLLERS
   ================================ */

// Tampilkan daftar user
module.exports.index = wrapAsync(async (req, res) => {
  const searchQuery = req.query.search || '';
  let users;

  if (searchQuery) {
    // Jika ada query, cari user yang cocok di username, email, atau role
    users = await User.find({
      $or: [
        { username: new RegExp(searchQuery, 'i') },
        { email: new RegExp(searchQuery, 'i') },
        { role: new RegExp(searchQuery, 'i') }
      ]
    });
  } else {
    users = await User.find({});
  }

  res.render('admin/users', { title: 'Manage Users', users, searchQuery });
});


// Render form create user
module.exports.renderCreateForm = (req, res) => {
  res.render('admin/create', { title: 'Create New User' });
};

module.exports.createUser = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      confirmPassword,
      role,
      name,
      phone,
      department,
      position,
      address,
      status
    } = req.body;

    // Validasi password cocok
    if (password !== confirmPassword) {
      req.flash('error_msg', 'Passwords do not match');
      return res.redirect('/admin/create');
    }

    // Role hanya bisa di-set oleh Admin
    let finalRole = 'Employee';
    if (req.user && req.user.role === 'Admin' && role) {
      finalRole = role;
    }

    // Buat user baru
    const user = new User({
      username,
      email,
      role: finalRole,
      profile: {
        name,
        phone,
        department,
        position,
        address,
        status
      }
    });

    const registeredUser = await User.register(user, password);

    // Jika role adalah Employee, tambahkan ke koleksi Employee
    if (finalRole === 'Employee') {
      const employee = new Employee({
        user: registeredUser._id
        // managerId bisa diisi nanti via update
      });
      await employee.save();

      // Generate QR code string (bisa pakai UUID atau hash)
      const qrCodeString = crypto.randomBytes(12).toString('hex');

      // Simpan ke database QR Code
      const qr = new QRCodeModel({
        code: qrCodeString,
        role: finalRole,
        issuedTo: registeredUser._id
      });
      await qr.save();

      // Generate image base64 untuk QR
      const qrImageData = await QRCodeLib.toDataURL(qrCodeString);

      // Simpan ke session agar bisa ditampilkan di halaman sukses
      req.session.qrImage = qrImageData;
    }

    req.flash('success', `User ${registeredUser.username} created successfully as ${finalRole}`);
    res.redirect('/admin/user-created');

  } catch (err) {
    console.error(err);
    req.flash('error_msg', err.message);
    res.redirect('/admin/create');
  }
};

// Tampilkan detail user
module.exports.showUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    res.render('admin/show', { title: 'User Details', user });
  } catch (err) {
    console.error('Error fetching user:', err);
    req.flash('error', 'Cannot fetch user details.');
    res.redirect('/admin/users');
  }
};

// Render form edit user
module.exports.renderEditForm = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    res.render('admin/edit', { title: 'Edit User', user });
  } catch (err) {
    console.error('Error fetching user:', err);
    req.flash('error', 'Cannot fetch user data.');
    res.redirect('/admin/users');
  }
};

// Update data user (PUT)
module.exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      username,
      email,
      role,
      name,
      phone,
      department,
      position,
      address,
      status
    } = req.body;

    // Validasi role agar hanya yang diperbolehkan
    if (!['Admin', 'Manager', 'Employee'].includes(role)) {
      req.flash('error', 'Invalid role selected');
      return res.redirect(`/admin/users/${id}/edit`);
    }

    // Validasi status juga jika ingin lebih aman
    if (!['Active', 'Inactive'].includes(status)) {
      req.flash('error', 'Invalid status');
      return res.redirect(`/admin/users/${id}/edit`);
    }

    // Update user sesuai schema (termasuk nested profile)
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        username,
        email,
        role,
        profile: {
          name,
          phone,
          department,
          position,
          address,
          status
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }

    req.flash('success', `User "${updatedUser.username}" updated successfully`);
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error updating user:', err);
    req.flash('error', 'Cannot update user.');
    res.redirect('/admin/users');
  }
};


// Render form delete user
module.exports.renderDeleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/users');
    }
    res.render('admin/users', { title: 'Delete User', user });
  } catch (err) {
    console.error('Error fetching user:', err);
    req.flash('error', 'Cannot fetch user data.');
    res.redirect('/admin/users');
  }
};

// Hapus user (DELETE)
module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    req.flash('success', 'User deleted successfully');
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error deleting user:', err);
    req.flash('error', 'Cannot delete user.');
    res.redirect('/admin/users');
  }
};
