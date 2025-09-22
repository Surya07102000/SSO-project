const express = require('express');
const authController = require('../controllers/auth.controller');
const { validateRequest } = require('../middlewares/requestValidator');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', validateRequest, authController.login);
router.post('/register', validateRequest, authController.register);
router.post('/change-password', authMiddleware,validateRequest, authController.changePassword);
router.post('/forgot-password', validateRequest, authController.forgotPassword);
router.post('/reset-password', validateRequest, authController.resetPassword);
router.post('/sso-login', authMiddleware, validateRequest, authController.ssoLogin);
router.post('/refresh-token', validateRequest, authController.refreshToken);
router.post('/logout', validateRequest, authController.logout);


module.exports = router;