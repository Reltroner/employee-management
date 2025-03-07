const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        
    },
    phone: {
        type: String,
        required: true,
        
    },
    department: {
        type: String,
        required: true,
        
    },
    position: {
        type: String,
        required: true,
        
    },
    address: {
        type: String,
        required: true,
        
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    attendance: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attendance'
    }]
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
