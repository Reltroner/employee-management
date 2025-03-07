const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index');

const isAuth = require('../middlewares/isAuth');


router.get('/', isAuth, indexController.renderHome);
router.get('/dashboard', isAuth,indexController.renderDashboard);

module.exports = router;
