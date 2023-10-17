const jwt = require('jsonwebtoken');
const config = require('../config/config');

const verifyToken = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers['authorization'];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'A token is required for authentication',
    });
  }

  try {
    const decoded = jwt.verify(token, config.secretJwt);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid Token',
    });
  }
};

module.exports = verifyToken;
