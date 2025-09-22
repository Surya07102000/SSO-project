const { validationResult } = require('express-validator');
const { error } = require('../utils/responseBuilder');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error.badRequest(res, 'Validation failed', errors.array());
  }
  next();
};

module.exports = {
  validateRequest
};
