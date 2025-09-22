const { authConfig } = require("../config/config");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function generateRefreshToken({ userId, email, role }) {
  const refreshToken = jwt.sign(
    { userId, email, role, tokenType: "refresh" },
    authConfig.JWT_SECRET_REFRESH,
    { expiresIn: authConfig.JWT_REFRESH_EXPIRY }
  );

  return refreshToken;
}

function generateAccessToken({ userId, email, role, roleName = null, application = null }) {
  const payload = { userId, email, role };
  
  // Include role name if provided
  if (roleName) {
    payload.roleName = roleName;
  }
  
  // Include application details if provided
  if (application) {
    payload.application = {
      id: application.id,
      name: application.name,
      description: application.description,
      is_active: application.is_active
    };
  }
  
  const accessToken = jwt.sign(payload, authConfig.JWT_SECRET, {
    expiresIn: authConfig.JWT_ACCESS_EXPIRY,
  });

  return accessToken;
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

function comparePassword(plainPassword, hashedPassword){
    return bcrypt.compare(plainPassword, hashedPassword);
};

function generateSSOResponseToken(responseData) {
  const payload = {
    ...responseData,
    tokenType: 'sso_response',
    iss: 'centralized-application-system',
    aud: 'sso-applications'
  };
  
  const ssoToken = jwt.sign(payload, authConfig.JWT_SECRET, {
    expiresIn: authConfig.JWT_ACCESS_EXPIRY,
  });

  return ssoToken;
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
  generateAccessToken,
  verifyAccessToken,
  verifyAccessTokenIgnoreExpiration,
  verifyRefreshToken,
  comparePassword,
  calculateTokenExpiry,
  generateSSOResponseToken
};
