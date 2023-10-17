const express = require('express');
const categoryRoute = express();
const categoryController = require('../controllers/categoryController');
const bodyParser = require('body-parser');
categoryRoute.use(bodyParser.json());
categoryRoute.use(bodyParser.urlencoded({ extended: true }));

const auth = require('../middleware/auth');

categoryRoute.post('/category-route', auth, categoryController.addCategory);

module.exports = categoryRoute;
