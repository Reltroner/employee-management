// routes/admin.js
const express = require('express');
const router = express.Router();
const admin = require('../controllers/admin');
const isAuth = require('../middlewares/isAuth');
const checkRole = require('../middlewares/checkRole');
const wrapAsync = require('../utils/wrapAsync');
const attendance = require('../controllers/attendance');

// Admin Dashboard
router.get('/dashboard/admin',
  isAuth,
  checkRole(['Admin']),
  admin.renderAdminDashboard
);

// Admin routes
router.get('/dashboard', isAuth, checkRole(['Admin']), (req, res) => {
  res.redirect('/dashboard/admin');
});

/* ===================================
   USER MANAGEMENT ROUTES
   =================================== */

// Index: Tampilkan semua user
router.get('/users',
  isAuth,
  checkRole(['Admin']),
  admin.index
);


// Create: Form & Proses
router.get('/create',
  isAuth,
  checkRole(['Admin']),
  admin.renderCreateForm
);
router.post('/users',
  isAuth,
  checkRole(['Admin']),
  wrapAsync(admin.createUser)
);
router.get('/user-created', (req, res) => {
  const qrImage = req.session.qrImage;
  req.session.qrImage = null; // Hapus setelah ditampilkan
  res.render('admin/user-created', { qrImage });
});

// Show: Detail user
router.get('/users/:id',
  isAuth,
  checkRole(['Admin']),
  wrapAsync(admin.showUser)
);

// Edit: Form & Update
router.get('/users/:id/edit',
  isAuth,
  checkRole(['Admin']),
  wrapAsync(admin.renderEditForm)
);
router.put('/users/:id',
  isAuth,
  checkRole(['Admin']),
  wrapAsync(admin.updateUser)
);

// Delete: Form & Hapus
router.get('/users/:id/delete',
  isAuth,
  checkRole(['Admin']),
  wrapAsync(admin.renderDeleteForm)
);
router.delete('/users/:id',
  isAuth,
  checkRole(['Admin']),
  wrapAsync(admin.deleteUser)
);

module.exports = router;
