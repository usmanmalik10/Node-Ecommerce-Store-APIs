const User = require('../models/userModel');
const bcryptjs = require('bcryptjs');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

//send Reset Password Email

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: 'For Reset Password',
      html: `<p>Hi ${name},</p>
      <p>Please click the following link to reset your password:</p>
      <a href="http://127.0.0.1:3000/api/reset-password?token=${token}">Reset Password</a>`,
    };

    // Use a Promise to send the email
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          reject(error);
        } else {
          console.log('Mail has been sent:', info.response);
          resolve(info.response);
        }
      });
    });
  } catch (error) {
    console.error('Error in sendResetPasswordMail:', error);
    throw error;
  }
};

// Generate Token Method
const createToken = async (id) => {
  try {
    const token = await jwt.sign({ _id: id }, config.secretJwt);
    return token;
  } catch (error) {
    // Handle errors gracefully, log them, and potentially send a response
    console.error(`Error while creating a token: ${error.message}`);
    throw error; // Rethrow the error if you want to handle it elsewhere
  }
};

const securePassword = async (password) => {
  try {
    const passwordHash = await bcryptjs.hash(password, 10);
    return passwordHash; // Return the hashed password
  } catch (error) {
    throw error; // Rethrow the error to handle it where you call the function
  }
};
//  Register Function Code
const registerUser = async (req, res) => {
  try {
    const spassword = await securePassword(req.body.password);

    // Check if email already exists
    const userEmail = await User.findOne({ email: req.body.email });

    if (userEmail) {
      return res
        .status(400)
        .json({ success: false, message: 'This email is already in use' });
    } else {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: spassword,
        image: req.file.filename,
        mobile: req.body.mobile,
        type: req.body.type,
      });

      const userData = await user.save();
      return res.status(200).json({
        success: true,
        message: 'Registration successful',
        data: userData,
      });
    }
  } catch (error) {
    console.error(`Error during registration: ${error.message}`);
    return res.status(400).json({
      success: false,
      message: 'An error occurred during registration',
    });
  }
};

//Login Method
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      return res
        .status(400)
        .json({ success: false, message: 'Email not found' });
    }

    const passwordMatch = await bcryptjs.compare(password, userData.password);

    if (!passwordMatch) {
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect password' });
    }

    const tokenData = await createToken(userData._id);

    const userResponse = {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      image: userData.image,
      type: userData.type,
      token: tokenData,
    };

    const response = {
      success: true,
      message: 'Login successful',
      data: userResponse,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(`Error during login: ${error.message}`);
    return res
      .status(400)
      .json({ success: false, message: 'An error occurred during login' });
  }
};

//Update Password Method

const updatePassword = async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const password = req.body.password;

    const data = await User.findOne({ _id: user_id });
    if (data) {
      const newPassword = await securePassword(password);

      const userData = await User.findByIdAndUpdate(
        { _id: user_id },
        {
          $set: {
            password: newPassword,
          },
        }
      );
      res
        .status(200)
        .send({ success: true, msg: 'You password has been updated' });
    } else {
      res.status(200).send({ success: false, msg: 'User Id not found' });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Forgot Password

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const randomString = randomstring.generate();
      const data = await User.updateOne(
        { email: email },
        { $set: { token: randomString } }
      );
      sendResetPasswordMail(userData.name, userData.email, randomString);

      res.status(200).send({
        success: true,
        msg: 'Please check your mail and reset password',
      });
    } else {
      res.status(200).send({ success: true, msg: 'This Email does not exist' });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

// Reset Password

const resetPassword = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      const password = req.body.password;
      const newPassword = await securePassword(password);
      const userData = await User.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPassword, token: '' } },
        { new: true }
      );
      res
        .status(200)
        .send({ success: false, msg: 'User password has been reset', data:userData });
    } else {
      res.status(200).send({ success: false, msg: 'Link Expired' });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
};

module.exports = {
  registerUser,
  userLogin,
  updatePassword,
  forgotPassword,
  resetPassword,
};
