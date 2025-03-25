const Attendance = require('../models/attendance');
const Employee = require('../models/employee');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ErrorHandler');

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
  
