// models/QRCode.js
const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // UUID atau Token
  role: { type: String, enum: ['Employee', 'Manager'], required: true },
  issuedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date }, // Optional: bisa digunakan untuk absen harian
  used: { type: Boolean, default: false }
});

module.exports = mongoose.model('QRCode', qrCodeSchema);
