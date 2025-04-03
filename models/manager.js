// models/manager.js
const mongoose = require('mongoose');

const managerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  team: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],

  attendance: [
    {
      date: { type: Date, default: Date.now },
      status: { type: String, enum: ['present', 'absent', 'pending'], default: 'pending' },
      location: {
        latitude: Number,
        longitude: Number
      },
      confirmedByManager: { type: Boolean, default: false },
      qrCodeUsed: { type: String },
      managerNote: { type: String }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Manager', managerSchema);
