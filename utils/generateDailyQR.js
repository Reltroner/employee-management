// utils/generateDailyQR.js
const crypto = require('crypto');
const QRCode = require('../models/QRCode');

module.exports = async function generateDailyQR(userId, role) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Cek apakah sudah ada QR untuk hari ini
  const existingQR = await QRCode.findOne({
    issuedTo: userId,
    expiresAt: { $gte: startOfDay, $lte: endOfDay },
    role
  });

  if (existingQR) return existingQR; // Gunakan yang sudah ada

  // Generate QR baru
  const qrCodeString = crypto.randomBytes(12).toString('hex');

  const qr = new QRCode({
    code: qrCodeString,
    role,
    issuedTo: userId,
    createdAt: new Date(),
    expiresAt: endOfDay,
    used: false
  });

  await qr.save();
  return qr;
}
