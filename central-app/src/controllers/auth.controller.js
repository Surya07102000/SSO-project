const authService = require('../services/auth.service');
const { success, error } = require('../utils/responseBuilder');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.login(email, password, req);
    
    if (result.success) {
      return success.ok(res, 'Login successful', result.data);
    } else {
      return error.unauthorized(res, result.message);
    }
    
  } catch (err) {
    if (err.statusCode === 401) {
      return error.unauthorized(res, err.message);
    } else if (err.statusCode === 500) {
      return error.internal(res, "Login failed", err);
    }
    if (err.statusCode === 403) {
      return error.forbidden(res, err.message);
    }
    return error.internal(res, "Login failed", err);
  }
}; 

const register = async (req, res) => {
  try {
    await authService.register(req.body);
    return success.ok(res, "Registration successful", null);
  } catch (err) {
    if (err.statusCode === 409) {
      return error.conflict(res, err.message);
    }
    return error.internal(res, "Registration failed", err);
  }
}; 


const changePassword = async (req, res) => {
  try {
    const result = await authService.changePassword(req);
    return success.ok(res, result.message, result.data);
  } catch (err) {
    if (err.statusCode === 400) {
      return error.badRequest(res, err.message);
    }
    if (err.statusCode === 404) {
      return error.notFound(res, err.message);
    }
    return error.internal(res, "Change password failed", err);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const result = await authService.forgotPassword(req);
    return success.ok(res, result.message, result.data);
  } catch (err) {
    if (err.statusCode === 400) {
      return error.badRequest(res, err.message);
    }
    if (err.statusCode === 404) {
      return error.notFound(res, err.message);
    }
    return error.internal(res, "Forgot password failed", err);
  }
};

const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(req);
    return success.ok(res, result.message, result.data);
  } catch (err) {
    if (err.statusCode === 400) {
      return error.badRequest(res, err.message);
    }
    if (err.statusCode === 404) {
      return error.notFound(res, err.message);
    }
    return error.internal(res, "Reset password failed", err);
  }
};

const refreshToken = async (req, res) => {
  try {
    const result = await authService.refreshToken(req);
    return success.ok(res, result.message, result.data);
  } catch (err) {
    if (err.statusCode === 400) {
      return error.badRequest(res, err.message);
    }
    if (err.statusCode === 401) {
      return error.unauthorized(res, err.message);
    }
    return error.internal(res, "Refresh token failed", err);
  }
};

const ssoLogin = async (req, res) => {
  try {
    const result = await authService.ssoLogin(req);
    return success.ok(res, result.message, result.data);
  } catch (err) {
    if (err.statusCode === 400) {
      return error.badRequest(res, err.message);
    }
    if (err.statusCode === 403) {
      return error.forbidden(res, err.message);
    }
    if (err.statusCode === 404) {
      return error.notFound(res, err.message);
    }
    return error.internal(res, "SSO login failed", err);
  }
};

const logout = async (req, res) => {
  try {
    const result = await authService.logout(req);
    return success.ok(res, result.message, result.data);
  } catch (err) {
    if (err.statusCode === 400) {
      return error.badRequest(res, err.message);
    }
    if (err.statusCode === 404) {
      return error.notFound(res, err.message);
    }
    return error.internal(res, "Logout failed", err);
  }
};

const logoutAllDevices = async (req, res) => {
  try {
    const result = await authService.logoutAllDevices(req);
    return success.ok(res, result.message, result.data);
  } catch (err) {
    return error.internal(res, "Logout from all devices failed", err);
  }
};

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