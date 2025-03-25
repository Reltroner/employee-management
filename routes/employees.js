const express = require('express');
const router = express.Router();
const Employee = require('../models/employee');
const employees = require('../controllers/employees');
const checkRole = require('../middlewares/checkRole');
const isAuth = require('../middlewares/isAuth');
const isAuthor = require('../middlewares/isAuthor');
const isValidObjectId = require('../middlewares/isValidObjectId');
const { validateEmployee } = require('../middlewares/validator');
const { employeeSchema } = require('../schemas/employee');
const wrapAsync = require('../utils/wrapAsync');
const upload = require('../config/multer');

router.get('/', isAuth, async (req, res) => {
    try {
        let searchQuery = req.query.search || '';
        let employees = searchQuery 
            ? await Employee.find({ name: new RegExp(searchQuery, 'i') }) 
            : await Employee.find();

        res.render('employees/index', {
            title: 'Manage Employees',
            employees,
            searchQuery,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

router.get('/create', isAuth, (req, res) => {
    res.render('employees/create', { title: 'Create Employee'});
});
router.post('/create', isAuth, validateEmployee, employees.createEmployee);

router.get('/:id', isAuth, isValidObjectId('/employees'), (req, res, next) => {
    console.log('View Employee:', req.params.id);
    next();
}, employees.showEmployee);
router.get('/:id/edit', isAuth, isValidObjectId('/employees'), (req, res, next) => {
    console.log('Edit Employee:', req.params.id);
    next();
}, employees.renderEditForm);

router.put('/:id', isAuth, isValidObjectId('/employees'), validateEmployee, employees.updateEmployee);

router.delete('/:id', isAuth, isValidObjectId('/employees'), (req, res, next) => {
    console.log('Delete Employee:', req.params.id);
    next();
}, employees.deleteEmployee);

module.exports = router;
