const Attendance = require('../models/attendance');
const Employee = require('../models/employee');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ErrorHandler');
const QRCode = require('../models/QRCode');
const Manager = require('../models/manager');
const User = require('../models/user');

const formatTime = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};

// Menampilkan daftar absensi semua karyawan
module.exports.index = wrapAsync(async (req, res) => {
    const searchQuery = req.query.search || '';
    let attendanceRecords;

    if (searchQuery) {
        attendanceRecords = await Attendance.find({}).populate({
            path: 'employee',
            match: { name: new RegExp(searchQuery, 'i') }
        });
        attendanceRecords = attendanceRecords.filter(record => record.employee);
    } else {
        attendanceRecords = await Attendance.find({}).populate('employee');
    }

    // Format waktu sebelum dikirim ke view
    attendanceRecords = attendanceRecords.map(record => {
        return {
            ...record._doc,
            checkInTime: formatTime(record.checkInTime),
            checkOutTime: formatTime(record.checkOutTime)
        };
    });

    res.render('attendance/index', { attendanceRecords, searchQuery });
});


module.exports.renderNewForm = async (req, res) => {
    try {
        const employees = await Employee.find({});
        res.render('attendance/create', { employees }); // Kirim data employees ke view
    } catch (err) {
        req.flash('error', 'Failed to load employee data.');
        return res.redirect('/attendance');
    }
};

module.exports.createAttendance = async (req, res) => {
    try {
        const { employee, date, checkInTime, checkOutTime, status } = req.body;

        const foundEmployee = await Employee.findById(employee);
        if (!foundEmployee) {
            req.flash('error', 'Employee not found');
            return res.redirect('/attendance/create');
        }

        const checkIn = new Date(`${date}T${checkInTime}:00`);
        const checkOut = checkOutTime ? new Date(`${date}T${checkOutTime}:00`) : null;

        const newAttendance = new Attendance({
            employee: foundEmployee._id,
            date,
            checkInTime: checkIn,
            checkOutTime: checkOut,
            status
        });

        await newAttendance.save();

        foundEmployee.attendance.push(newAttendance);
        await foundEmployee.save();

        req.flash('success', 'Attendance recorded successfully');
        res.redirect('/attendance');
    } catch (err) {
        console.error('Error saving attendance:', err);
        req.flash('error', 'Failed to record attendance');
        res.redirect('/attendance/create');
    }
};

module.exports.scanQRCode = async (req, res) => {
    try {
      const { code, latitude, longitude } = req.body;
      const userId = req.user._id;
  
      const qr = await QRCode.findOne({ code, used: false });
      if (!qr) {
        return res.status(400).json({ message: 'Invalid or expired QR code.' });
      }
  
      // Check QR code expiry
      if (qr.expiresAt && qr.expiresAt < new Date()) {
        return res.status(400).json({ message: 'QR code expired.' });
      }
  
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found.' });
  
      if (user.role === 'Employee') {
        await Employee.updateOne(
          { user: userId },
          {
            $push: {
              attendance: {
                status: 'present',
                location: { latitude, longitude },
                qrCodeUsed: code
              }
            }
          }
        );
      } else if (user.role === 'Manager') {
        await Manager.updateOne(
          { user: userId },
          {
            $push: {
              attendance: {
                status: 'present',
                location: { latitude, longitude },
                qrCodeUsed: code
              }
            }
          }
        );
      }
  
      qr.used = true;
      await qr.save();
  
      res.status(200).json({ message: 'Attendance recorded successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };
  
module.exports.viewLog = async (req, res) => {
    console.log("🔍 Admin accessing attendance log");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employees = await Employee.find()
      .populate('user')
      .lean();
    const managers = await Manager.find()
      .populate('user')
      .lean();
    const admins = await User.find({ role: 'Admin' }).lean();

    const employeeAttendance = employees.flatMap(emp => {
      return emp.attendance
        .filter(a => new Date(a.date) >= today)
        .map(a => ({ ...a, user: emp.user }));
    });

    const managerAttendance = managers.flatMap(mgr => {
      return mgr.attendance
        .filter(a => new Date(a.date) >= today)
        .map(a => ({ ...a, user: mgr.user }));
    });

    const adminAttendance = admins.flatMap(admin => {
      return (admin.attendance || [])
        .filter(a => new Date(a.date) >= today)
        .map(a => ({ ...a, user: admin }));
    });

    const attendanceRecords = [...employeeAttendance, ...managerAttendance, ...adminAttendance]
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    res.render('attendance/log', { attendanceRecords, user: req.user });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load attendance log.');
    res.redirect('/attendance/log');
  }
};


// Menampilkan detail absensi berdasarkan ID
module.exports.showAttendance = async (req, res) => {
    const { id } = req.params;
    const attendance = await Attendance.findById(id).populate('employee');
    if (!attendance) {
        req.flash('error', 'Attendance record not found!');
        return res.redirect('/attendance');
    }else {
        res.render('attendance/show', { attendance });
    }
    
};

module.exports.userHistory = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        req.flash('error_msg', 'User not found.');
        return res.redirect('/login');
      }
  
      let attendanceRecords = [];
  
      if (user.role === 'Employee') {
        const employee = await Employee.findOne({ user: user._id });
        if (employee) attendanceRecords = employee.attendance;
      } else if (user.role === 'Manager') {
        const manager = await Manager.findOne({ user: user._id });
        if (manager) attendanceRecords = manager.attendance;
      } else {
        return res.redirect('/dashboard');
      }
  
      // Filter tanggal jika disediakan
      let { start, end } = req.query;
      let startDate = start ? new Date(start) : null;
      let endDate = end ? new Date(end) : null;
  
      if (startDate) startDate.setHours(0, 0, 0, 0);
      if (endDate) endDate.setHours(23, 59, 59, 999);
  
      if (startDate && endDate) {
        attendanceRecords = attendanceRecords.filter(record => {
          const date = new Date(record.date);
          return date >= startDate && date <= endDate;
        });
      }
  
      res.render('attendance/history', {
        user,
        attendanceRecords: attendanceRecords.sort((a, b) => new Date(b.date) - new Date(a.date)),
        startDate: start || '',
        endDate: end || ''
      });
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Failed to load attendance history.');
      res.redirect('/dashboard');
    }
  };

  module.exports.approveAttendance = async (req, res) => {
    try {
      const { userId, index } = req.params;
  
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
  
      if (user.role === 'Employee') {
        const employee = await Employee.findOne({ user: userId });
        if (!employee || !employee.attendance[index]) throw new Error('Attendance not found');
  
        employee.attendance[index].status = 'present';
        employee.attendance[index].confirmedByManager = true;
        await employee.save();
      } else if (user.role === 'Manager') {
        const manager = await Manager.findOne({ user: userId });
        if (!manager || !manager.attendance[index]) throw new Error('Attendance not found');
  
        manager.attendance[index].status = 'present';
        manager.attendance[index].confirmedByManager = true;
        await manager.save();
      }
  
      req.flash('success', 'Attendance approved.');
      res.redirect('/attendance/log');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', err.message);
      res.redirect('/attendance/log');
    }
  };

  module.exports.rejectAttendance = async (req, res) => {
    try {
      const { userId, index } = req.params;
  
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
  
      if (user.role === 'Employee') {
        const employee = await Employee.findOne({ user: userId });
        if (!employee || !employee.attendance[index]) throw new Error('Attendance not found');
  
        employee.attendance[index].status = 'absent';
        employee.attendance[index].confirmedByManager = true;
        await employee.save();
      } else if (user.role === 'Manager') {
        const manager = await Manager.findOne({ user: userId });
        if (!manager || !manager.attendance[index]) throw new Error('Attendance not found');
  
        manager.attendance[index].status = 'absent';
        manager.attendance[index].confirmedByManager = true;
        await manager.save();
      }
  
      req.flash('success', 'Attendance rejected.');
      res.redirect('/attendance/log');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', err.message);
      res.redirect('/attendance/log');
    }
  };

// Menampilkan form edit absensi
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const attendance = await Attendance.findById(id).populate('employee');
    const employees = await Employee.find({});
    if (!attendance) {
        req.flash('error', 'Attendance record not found!');
        return res.redirect('/attendance');
    }
    console.log(attendance);
    res.render('attendance/edit', { attendance, employees });
};

// Memperbarui absensi berdasarkan ID
module.exports.updateAttendance = async (req, res) => {
    console.log('Request body:', req.body);
    const { id } = req.params;
    const { date, checkInTime, checkOutTime, status } = req.body;

    // Gabungkan tanggal dan waktu jadi format Date yang valid
    const checkInDateTime = new Date(`${date}T${checkInTime}:00`);
    const checkOutDateTime = new Date(`${date}T${checkOutTime}:00`);

    await Attendance.findByIdAndUpdate(
        id,
        {
            date: new Date(date),
            checkInTime: checkInDateTime,
            checkOutTime: checkOutDateTime,
            status
        },
        { new: true, runValidators: true }
    );

    req.flash('success', 'Attendance record updated successfully!');
    res.redirect(`/attendance`);
};


// Menghapus absensi berdasarkan ID
module.exports.deleteAttendance = async (req, res) => {
    const { id } = req.params;
    await Attendance.findByIdAndDelete(id);
    req.flash('success', 'Attendance record deleted successfully!');
    res.redirect('/attendance'); // Penting: pastikan ada res.redirect atau res.json!
};

module.exports.roleCheck = async (req, res) => {
    if (req.user.role === 'Admin') {
        // Admin => semua record
        return attendance.indexAll(req, res);
    } 
    if (req.user.role === 'Manager') {
        // Manager => attendance untuk karyawan di tim-nya
        return attendance.indexManagerTeam(req, res);
    } 
    // Employee => attendance untuk dirinya sendiri
    return attendance.indexEmployee(req, res);
}

module.exports.indexAll = async (req, res) => {
    // Menampilkan seluruh attendance
    const attendanceRecords = await Attendance.find({}).populate('employee');
    res.render('attendance/index', { attendanceRecords });
  };

module.exports.indexManagerTeam = async (req, res) => {
    // Menampilkan attendance karyawan yang manager-nya = req.user._id
    // Caranya: cari semua employee yang manager = req.user._id, lalu filter attendance-nya
    const employeesInTeam = await Employee.find({ manager: req.user._id });
    const employeeIds = employeesInTeam.map(emp => emp._id);
  
    const attendanceRecords = await Attendance.find({ employee: { $in: employeeIds } }).populate('employee');
    res.render('attendance/index', { attendanceRecords });
};

  module.exports.indexEmployee = async (req, res) => {
    // Menampilkan attendance user itu sendiri
    // Agar match, Anda perlu mengaitkan user dengan employee, misalnya user punya field employeeId
    // Atau sebaliknya. Jika tidak ada, Anda perlu logika lain (misalnya email)
    // Misalnya, jika user punya employeeProfile = <ObjectId>:
    
    // 1) Pastikan user -> employeeProfile
    // 2) Lalu:
    const attendanceRecords = await Attendance.find({ employee: req.user.employeeProfile })
        .populate('employee');
    res.render('attendance/index', { attendanceRecords });
  };
  
