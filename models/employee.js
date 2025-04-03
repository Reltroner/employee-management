const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Koneksi ke User
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager' },
  
    attendance: [{
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ['present', 'absent', 'pending'], default: 'pending' },
      location: {
        latitude: Number,
        longitude: Number
      },
      confirmedByManager: { type: Boolean, default: false },
      qrCodeUsed: { type: String },
      managerNote: { type: String }, // optional note by manager
    }],
  }, { timestamps: true });
  

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
