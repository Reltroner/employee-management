const Employee = require('../models/employee');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ErrorHandler');

// Tampilkan semua karyawan
module.exports.index = wrapAsync(async (req, res) => {
    const employees = await Employee.find({});
    res.render('employees/index', { employees });
});


// Tambah karyawan baru
module.exports.createEmployee = async (req, res) => {
    console.log('Request Body:', req.body);
    try {
        const { name, email, phone, department, position, address, status } = req.body;
        await Employee.create({ name, email, phone, department, position, address, status });
        req.flash('success', 'Employee added successfully!');
        res.redirect('/employees');
    } catch (err) {
        console.error('Error creating employee:', err);
        req.flash('error', 'Failed to add employee.');
        res.redirect('/employees/create');
    }
};

// Tampilkan detail karyawan
module.exports.showEmployee = wrapAsync(async (req, res) => {
    console.log("Fetching employee data...");
    const employee = await Employee.findById(req.params.id);
    if (req.user.role === 'Manager' && String(employee.manager) !== String(req.user._id)) {
        req.flash('error_msg', 'Not allowed to view this employee!');
        return res.redirect('/employees');
    }
    if (!employee) {
        req.flash('error', 'Employee not found!');
        return res.redirect('/employees');
    }
    res.render('employees/show', { employee });
});

// Tampilkan form edit karyawan
module.exports.renderEditForm = wrapAsync(async (req, res) => {
    console.log("Fetching employee data...");
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
        req.flash('error', 'Employee not found!');
        return res.redirect('/employees');
    }
    res.render('employees/edit', { employee });
});

// Update data karyawan
module.exports.updateEmployee = async (req, res) => {
    try {
        const { name, email, phone, department, position, address, status } = req.body;
        await Employee.findByIdAndUpdate(req.params.id, { name, email, phone, department, position, address, status });
        req.flash('success', 'Employee updated successfully!');
        res.redirect(`/employees`);
    } catch (error) {
        console.error('Error updating employee:', error);
        req.flash('error', 'Failed to update employee.');
        res.redirect('/employees');
    }
};


// Hapus karyawan
module.exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        await Employee.findByIdAndDelete(id);
        req.flash('success', 'Employee deleted successfully');
        res.redirect('/employees'); // Pastikan redirect ini tidak memanggil ulang endpoint yang sama terus-menerus
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

