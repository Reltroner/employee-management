const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    role: {
        type: String,
        enum: ['Admin', 'Manager', 'Employee'],
        default: 'Employee'
      }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
