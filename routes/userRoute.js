const express = require('express');
const Route = express.Router(); // Use express.Router() to create a router

const bodyParser = require('body-parser');
Route.use(bodyParser.json());
Route.use(bodyParser.urlencoded({ extended: true }));

const multer = require('multer');
const path = require('path');

Route.use(express.static('public'));

// Multer Function: File destination and filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(
      null,
      path.join(__dirname, '../public/userImages') // Use path.join to construct the correct directory path
    );
  },
  filename: function (req, file, cb) {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name); // Set the filename to the current timestamp followed by the original filename
  },
});

const upload = multer({ storage: storage });

// Import the userController and auth middleware
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Register a user with file upload
Route.post('/register', upload.single('image'), userController.registerUser);

// User login route
Route.post('/login', userController.userLogin);

// Testing route with JWT Token authentication
Route.get('/test', auth, function (req, res) {
  res.status(200).send({ success: true, msg: 'Authenticated' });
});

// Update password route (requires authentication)
Route.post('/update-password', auth, userController.updatePassword);

// Forgot password route
Route.post('/forgot-password', userController.forgotPassword);

// Reset password route (you may need to implement this route in your controller)
Route.get('/reset-password', userController.resetPassword);

module.exports = Route; // Export the router
