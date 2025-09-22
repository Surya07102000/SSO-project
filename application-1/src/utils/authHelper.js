const { authConfig } = require("../config/config");
const jwt = require('jsonwebtoken');

function generateRefreshToken({ userId, email, role }) {
  const refreshToken = jwt.sign(
    { userId, email, role, tokenType: "refresh" },
    authConfig.JWT_SECRET_REFRESH,
    { expiresIn: authConfig.JWT_REFRESH_EXPIRY }
  );

  return refreshToken;
}
function verifyAccessToken(token) {
  return jwt.verify(token, authConfig.JWT_SECRET);
}

function verifyAccessTokenIgnoreExpiration(token) {
  return jwt.verify(token, authConfig.JWT_SECRET, { ignoreExpiration: true });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, authConfig.JWT_SECRET_REFRESH);
}

// Helper function to calculate token expiry based on config
function calculateTokenExpiry(expiryString) {
  const expiry = new Date();
  
  if (expiryString.endsWith('d')) {
    expiry.setDate(expiry.getDate() + parseInt(expiryString));
  } else if (expiryString.endsWith('h')) {
    expiry.setHours(expiry.getHours() + parseInt(expiryString));
  } else if (expiryString.endsWith('m')) {
    expiry.setMinutes(expiry.getMinutes() + parseInt(expiryString));
  } else {
    // Default to 30 days if format not recognized
    expiry.setDate(expiry.getDate() + 30);
  }
  
  return expiry;
}

module.exports = {
  generateRefreshToken,
  verifyAccessToken,
  verifyAccessTokenIgnoreExpiration,
  verifyRefreshToken,
  calculateTokenExpiry,
};
