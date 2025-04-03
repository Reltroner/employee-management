// models/user.js
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Employee'],
    default: 'Employee'
  },

  profile: {
    name: { type: String },
    phone: { type: String },
    department: { type: String },
    position: { type: String },
    address: { type: String },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
  }
}, { timestamps: true });

// Integrasi passport-local-mongoose (hash password & auth methods)
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
