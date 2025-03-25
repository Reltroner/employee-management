// middlewares/checkRole.js
module.exports = function checkRole(roles = []) {
    return function (req, res, next) {
      // Pastikan user sudah login (req.isAuthenticated() atau req.user)
      if (!req.user) {
        req.flash('error_msg', 'You must be logged in first!');
        return res.redirect('/login');
      }
  
      // Cek apakah role user termasuk salah satu yang diizinkan
      if (!roles.includes(req.user.role)) {
        req.flash('error_msg', 'You do not have permission to access this resource!');
        return res.redirect('back'); // atau ke halaman lain
      }
  
      return next();
    };
  };
  