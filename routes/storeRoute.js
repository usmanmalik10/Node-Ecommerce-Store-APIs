const express = require('express');
const storeRoute = express.Router(); // Use express.Router() to create a router
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const storeController = require('../controllers/storeController');

storeRoute.use(bodyParser.json());
storeRoute.use(bodyParser.urlencoded({ extended: true }));

// Multer Function file destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      path.join(__dirname, '../public/storeImages') // Use path.join to construct the correct directory path
    );
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '_' + file.originalname;
    cb(null, name); // Use the correct filename
  },
});

const upload = multer({ storage: storage });

storeRoute.post(
  '/create_store',
  auth,
  upload.single('logo'), // Make sure your form includes an input field with name="logo"
  storeController.createStore
);

module.exports = storeRoute; // Export the router, not an object with a property
