const mongoose = require('mongoose');
const attendance = require('../models/attendance');

mongoose.connect('mongodb://127.0.0.1/employee-attendance')
.then((result) => {
    console.log('connected to mongodb')
}).catch((err) => {
    console.log(err)
});

async function seedAttendances() {
    const attendances = [
        
    ];

    try {
        await attendance.deleteMany({}); // Hapus semua data sebelumnya
        await attendance.insertMany(attendances);
        console.log('Attendance data seeded!');
    } catch (error) {
        console.log('Terjadi kesalahan saat menyimpan data: ',error);
    } finally {
        mongoose.disconnect();
    }
}

seedAttendances();
