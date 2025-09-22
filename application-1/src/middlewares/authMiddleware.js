const jwt = require("jsonwebtoken");
const { authConfig } = require("../config/config")
const { error } = require("../utils/responseBuilder.js");
const { refresh_tokens } = require("../model/init-models");

const authMiddleware = async (req, res, next) => {
  try {

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return error.unauthorized(res, "Authentication required");
    }

    const decoded = jwt.verify(token, authConfig.JWT_SECRET);
    
    // Check if refresh token is revoked in database
    const tokenRecord = await refresh_tokens.findOne({
      where: {
        user_id: decoded.userId,
        is_revoked: false
      }
    });

    if (!tokenRecord) {
      return res
        .status(401)
        .json({ message: "Token has been revoked", code: "TOKEN_REVOKED", success: false });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Token expired", code: "TOKEN_EXPIRED", success: false });
    }
    return res
      .status(401)
      .json({ message: "Invalid token", code: "INVALID_TOKEN", success: false });
  }
};

module.exports = {
  authMiddleware,
};
