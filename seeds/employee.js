const mongoose = require('mongoose');
const employee = require('../models/employee');

mongoose.connect('mongodb://127.0.0.1/employee-attendance')
.then((result) => {
    console.log('connected to mongodb')
}).catch((err) => {
    console.log(err)
});

async function seedEmployees() {
    const employees = [
        {
            name: "Budi Santoso",
            email: "budi@example.com",
            phone: "081234567890",
            department: "IT",
            position: "Software Engineer",
            address: "Jl. Raya, No. 123",
            status: "Active",
        },
        {
            name: "Siti Rahma",
            email: "siti@example.com",
            phone: "081298765432",
            department: "Human Resources",
            position: "HR Manager",
            address: "Jl. Raya, No. 456",
            status: "Active",
        },
        {
            name: "Andi Pratama",
            email: "andi@example.com",
            phone: "081211223344",
            department: "Marketing",
            position: "Marketing Executive",
            address: "Jl. Raya, No. 789",
            status: "Active",
        },
        {
            name: "Tina Putri",
            email: "tina@example.com",
            phone: "081112233445",
            department: "Sales",
            position: "Sales Representative",
            address: "Jl. Raya, No. 321",
            status: "Active",
        },
        {
            name: "Rudi Santoso",
            email: "rudi@example.com",
            phone: "081234567890",
            department: "IT",
            position: "Software Engineer",
            address: "Jl. Raya, No. 123",
            status: "Active",
        },
    ];

    try {
        await employee.deleteMany({}); // Hapus semua data sebelumnya
        await employee.insertMany(employees);
        console.log('Employee data seeded!');
    } catch (error) {
        console.log('Terjadi kesalahan saat menyimpan data: ',error);
    } finally {
        mongoose.disconnect();
    }
}

seedEmployees();
