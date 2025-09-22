const { USER_STATUS } = require("../common/constant");
const { users, invitation_tokens, applications, refresh_tokens } = require("../model/init-models");
const { hashPassword } = require("../utils/password");
const authHelper = require('../utils/authHelper')
const crypto = require('crypto');
const { authConfig } = require('../config/config');

async function login(email, password, req = null) {
  try {
    const user = await users.findOne({
      where: {
        email: email.toLowerCase().trim(),
        status: USER_STATUS.ACTIVE
      },
    });

    if (!user) {
      let err = new Error("Invalid email");
      err.statusCode = 401;
      throw err;
    }

    const isPasswordValid = await authHelper.comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      let err = new Error("Invalid email or password.");
      err.statusCode = 401;
      throw err;
    }

    const accessToken = authHelper.generateAccessToken({
      userId: user.id,
      email: user.email
    });

    const refreshToken = authHelper.generateRefreshToken({
      userId: user.id,
      email: user.email
    });
    
    const refreshTokenExpiry = authHelper.calculateTokenExpiry(authConfig.JWT_REFRESH_EXPIRY);
    // console.log("refreshTokenExpiry", refreshTokenExpiry);

    await refresh_tokens.create({
      user_id: user.id,
      token: refreshToken,
      device_info: req?.headers?.['user-agent'] || 'Unknown device',
      expires_at: refreshTokenExpiry
    });

    // Update user's last login timestamp
    await users.update(
      { last_login: new Date() },
      { where: { id: user.id } }
    );

    const { password_hash, ...publicUserData } = user.toJSON();

    return {
      success: true,
      message: "User Login successful",
      data: {
        publicUserData: {
          ...publicUserData,
          email: user.email
        },
        accessToken,
        refreshToken
      }
    }

  } catch (error) {
    if (error.name === "SequelizeDatabaseError") {
      const err = new Error("Database error during login");
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }
}

async function register(user) {
  try {
    const { email, password, first_name, last_name } = user;

    // Check if email already exists in users
    const existingUser = await users.findOne({ 
      where: { 
        email: email.toLowerCase().trim()
      } 
    });

    if (existingUser) {
      const err = new Error("User email already exists");
      err.statusCode = 409;
      throw err;
    }

    // Create user directly with email
    await users.create({
      first_name,
      last_name,
      email: email.toLowerCase().trim(),
      password_hash: await hashPassword(password),
      status: USER_STATUS.ACTIVE,
    });

    return {
      success: true,
      message: "User Registration successful",
    };
  } catch (error) {
    if (error.name === "SequelizeDatabaseError") {
      const err = new Error("Database error during registration");
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }
}

const changePassword = async (req) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    const { userId } = req.user;

    if (!current_password || !new_password || !confirm_password) {
      const err = new Error('Current password, new password, and confirm password are required');
      err.statusCode = 400;
      throw err;
    }

    const user = await users.findOne({ where: { id: userId } });
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const isPasswordValid = await authHelper.comparePassword(current_password, user.password_hash);
    if (!isPasswordValid) {
      const err = new Error('Current password is incorrect');
      err.statusCode = 400;
      throw err;
    }

    if (new_password !== confirm_password) {
      const err = new Error('New password and confirm password do not match');
      err.statusCode = 400;
      throw err;
    }

    const isSamePassword = await authHelper.comparePassword(new_password, user.password_hash);
    if (isSamePassword) {
      const err = new Error('New password must be different from current password');
      err.statusCode = 400;
      throw err;
    }

    user.password_hash = await hashPassword(new_password);
    await user.save();

    // Email notification removed

    return {
      success: true,
      message: "Password changed successfully",
    };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    if (error.name === "SequelizeDatabaseError") {
      const err = new Error(`Database error during password change: ${error.message}`);
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }
}

const forgotPassword = async (req) => {
  try {
    const { email } = req.body;

    // Find user by email in users table
    const user = await users.findOne({
      where: {
        email: email.toLowerCase().trim(),
        status: USER_STATUS.ACTIVE
      }
    });

    if (!user) {
      const err = new Error('Email not found in our system. Please check and try again.');
      err.statusCode = 404;
      throw err;
    }

    if (user.status === USER_STATUS.INACTIVE) {
      const err = new Error('Your account is inactive. Please contact support or check your email for activation instructions.');
      err.statusCode = 400;
      throw err;
    }
  
    if (user.status === USER_STATUS.NOT_VERIFIED) {
      const err = new Error('Your account is not verified. Please check your email for verification instructions.');
      err.statusCode = 400;
      throw err;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    await invitation_tokens.destroy({
      where: { 
        user_id: user.id,
        email: email,
      },
    });

    await invitation_tokens.create({
      user_id: user.id,
      token: resetToken,
      email: email,
      expires_at: resetExpires
    });

    const baseUrl = process.env.FRONTEND_URL ;
    const resetURL = `${baseUrl}/reset-password?token=${resetToken}`;


    const responseObj = {
      message: 'Email sent successfully you will receive a password reset link shortly'
    };


    return {
      success: true,
      message: "Email sent successfully you will receive a password reset link shortly",
      data: responseObj
    };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    if (error.name === "SequelizeDatabaseError") {
      const err = new Error(`Database error during password change: ${error.message}`);
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }
}

const resetPassword = async (req) => {
  try {
    const { token, new_password, confirm_password } = req.body;

    if (!token || !new_password || !confirm_password) {
      const err = new Error('New password and confirm password are required');
      err.statusCode = 400;
      throw err;
    }

    if (new_password !== confirm_password) {
      const err = new Error('New password and confirm password do not match');
      err.statusCode = 400;
      throw err;
    }

    const resetToken = await invitation_tokens.findOne({
      where: {
        token,
        is_used: false,
        expires_at: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!resetToken) {
      const err = new Error('Invalid or expired reset token');
      err.statusCode = 400;
      throw err;
    }

    // Find user by the token's user_id
    const user = await users.findOne({
      where: {
        id: resetToken.user_id,
        status: USER_STATUS.ACTIVE
      }
    });

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      const err = new Error('Account is not active. Please contact support.');
      err.statusCode = 400;
      throw err;
    }

    user.password_hash = await hashPassword(new_password);
    await user.save();

    resetToken.is_used = true;
    resetToken.used_at = new Date();
    await resetToken.save();

    return {
      success: true,
      message: "Password reset successfully",
    };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    if (error.name === "SequelizeDatabaseError") {
      const err = new Error(`Database error during password reset: ${error.message}`);
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }
}

const refreshToken = async (req) => {
  try {
    const { refreshToken: refreshTokenFromBody } = req.body;

    if (!refreshTokenFromBody) {
      const err = new Error('Refresh token is required');
      err.statusCode = 400;
      throw err;
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = authHelper.verifyRefreshToken(refreshTokenFromBody);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        // Clean up expired token from database
        try {
          await refresh_tokens.destroy({
            where: { 
              token: refreshTokenFromBody,
              is_revoked: false
            }
          });
        } catch (cleanupError) {
          console.error('Error cleaning up expired token:', cleanupError);
        }
        
        const err = new Error('Refresh token expired');
        err.statusCode = 401;
        throw err;
      }
      
      const err = new Error('Invalid refresh token');
      err.statusCode = 401;
      throw err;
    }

    // Check if token type is correct
    if (decoded?.tokenType !== 'refresh') {
      const err = new Error('Invalid token type');
      err.statusCode = 401;
      throw err;
    }

    // Check if token exists in database and is not revoked
    const tokenRecord = await refresh_tokens.findOne({
      where: {
        token: refreshTokenFromBody,
        user_id: decoded.userId,
        is_revoked: false,
        expires_at: {
          [require('sequelize').Op.gt]: new Date() // Token not expired in DB
        }
      }
    });

    if (!tokenRecord) {
      const err = new Error('Token has been invalidated or expired');
      err.statusCode = 401;
      throw err;
    }

    // Find user to generate new tokens
    const user = await users.findOne({
      where: { 
        id: decoded.userId,
        status: USER_STATUS.ACTIVE
      }
    });

    if (!user) {
      const err = new Error('User not found or inactive');
      err.statusCode = 401;
      throw err;
    }

    // Generate new tokens
    const newAccessToken = authHelper.generateAccessToken({
      userId: user.id,
      email: user.email
    });

    const newRefreshToken = authHelper.generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    const refreshTokenExpiry = authHelper.calculateTokenExpiry(authConfig.JWT_REFRESH_EXPIRY);
    // console.log("refreshTokenExpiry", refreshTokenExpiry);

    await refresh_tokens.update(
      {
        token: newRefreshToken,
        expires_at: refreshTokenExpiry,
        created_at: new Date()
      },
      {
        where: { id: tokenRecord.id }
      }
    );

    const { password_hash, ...publicUserData } = user.toJSON();

    return {
      success: true,
      message: "Token refreshed successfully",
      data: {
        user: publicUserData,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    if (error.name === "SequelizeDatabaseError") {
      const err = new Error(`Database error during refresh token: ${error.message}`);
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }
}

const ssoLogin = async (req) => {
  try {
    const { application_id } = req.body;
    const { userId } = req.user;

    if (!application_id) {
      const err = new Error('Application ID is required');
      err.statusCode = 400;
      throw err;
    }

    const user = await users.findOne({
      where: { 
        id: userId,
        status: USER_STATUS.ACTIVE
      }
    });

    if (!user) {
      const err = new Error('User not found or inactive');
      err.statusCode = 404;
      throw err;
    }

    const application = await applications.findOne({
      where: { 
        id: application_id,
        is_active: true
      }
    });

    if (!application) {
      const err = new Error('Application not found or inactive');
      err.statusCode = 404;
      throw err;
    }

    // Generate access token with application details and role name for SSO
    const accessToken = authHelper.generateAccessToken({
      userId: user.id,
      email: user.email,
      application: {
        id: application.id,
        name: application.name,
        description: application.description,
        is_active: application.is_active
      }
    });

    const refreshToken = authHelper.generateRefreshToken({
      userId: user.id,
      email: user.email
    });

    const applicationUrlMap = {
      1: process.env.APPLICATION_URL_1 || 'https://application-1.lawsikho.dev',
      2: process.env.APPLICATION_URL_2 || 'https://application-2.lawsikho.dev',
    };
    const application_base_url = applicationUrlMap[application.id] || null;

    // Generate SSO token with complete response data including application details
    const responseData = {
      message: "Login successful",
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
      application: {
        id: application.id,
        name: application.name,
        description: application.description,
        is_active: application.is_active
      },
      application_base_url,
      tokens: {
        accessToken,
        refreshToken
      }
    };

    const ssoToken = authHelper.generateSSOResponseToken(responseData);

    const refreshTokenExpiry = authHelper.calculateTokenExpiry(authConfig.JWT_REFRESH_EXPIRY);

    await refresh_tokens.create({
      user_id: user.id,
      token: refreshToken,
      device_info: req?.headers?.['user-agent'] || 'SSO Login',
      expires_at: refreshTokenExpiry
    });

    // Update user's last login timestamp
    await users.update(
      { last_login: new Date() },
      { where: { id: user.id } }
    );

    return {
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          status: user.status
        },
        application: {
          id: application.id,
          name: application.name,
          description: application.description,
          is_active: application.is_active
        },
        application_base_url,
        tokens: {
          ssoToken
        }
      }
    };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    if (error.name === "SequelizeDatabaseError") {
      const err = new Error(`Database error during SSO login: ${error.message}`);
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }
}

  const logout = async (req) => {
    try {
      const { refreshToken: refreshTokenFromBody, accessToken } = req.body;

      if (!refreshTokenFromBody) {
        const err = new Error('Refresh token is required');
        err.statusCode = 400;
        throw err;
      }

      let userId = null;
      const sequelize = users.sequelize;
      const t = await sequelize.transaction();

      try {
        // Try to get user ID from access token even if it's expired
        if (accessToken) {
          try {
            // Verify the token but ignore expiration
            const decoded = authHelper.verifyAccessTokenIgnoreExpiration(accessToken);
            userId = decoded.userId;
          } catch (tokenError) {
            console.log('Failed to decode access token:', tokenError.message);
          }
        }

        // If we couldn't get userId from access token, try refresh token
        if (!userId && refreshTokenFromBody) {
          try {
            const decoded = authHelper.verifyRefreshToken(refreshTokenFromBody);
            userId = decoded.userId;
          } catch (tokenError) {
            console.log('Failed to decode refresh token:', tokenError.message);
          }
        }

        if (!userId) {
          const err = new Error('Unable to determine user from provided tokens');
          err.statusCode = 400;
          throw err;
        }

        // Mark the specific refresh token as revoked
        const result = await refresh_tokens.update(
          { 
            is_revoked: true,
            revoked_at: new Date()
          },
          { 
            where: { 
              user_id: userId,
              token: refreshTokenFromBody,
              is_revoked: false
            },
            transaction: t
          }
        );

        if (result[0] === 0) {
          const err = new Error('Token not found or already revoked');
          err.statusCode = 404;
          throw err;
        }

        await t.commit();

        return {
          success: true,
          message: "Logged out successfully"
        };

      } catch (error) {
        await t.rollback();
        throw error;
      }

    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      if (error.name === "SequelizeDatabaseError") {
        const err = new Error(`Database error during logout: ${error.message}`);
        err.statusCode = 500;
        throw err;
      }
      throw error;
    }
  }

const logoutAllDevices = async (req) => {
  try {
    const { userId } = req.user;

    // Mark all refresh tokens as revoked for this user
    await refresh_tokens.update(
      { 
        is_revoked: true,
        revoked_at: new Date()
      },
      { 
        where: { 
          user_id: userId,
          is_revoked: false
        }
      }
    );

    return {
      success: true,
      message: "Logged out from all devices successfully"
    };

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    if (error.name === "SequelizeDatabaseError") {
      const err = new Error(`Database error during logout from all devices: ${error.message}`);
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }
}

module.exports = {
  login,
  register,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  logoutAllDevices,
  ssoLogin
};