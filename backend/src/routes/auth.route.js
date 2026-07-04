const express = require('express');
const controller = require('../controllers/auth.controller');
const { authenticate, loginLimiter, registerLimiter, forgotPasswordLimiter } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', registerLimiter, controller.register);
router.post('/login', loginLimiter, controller.login);
router.post('/admin/login', loginLimiter, controller.adminLogin);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);

router.get('/me', authenticate, controller.me);
router.put('/profile', authenticate, controller.updateProfile);
router.put('/change-password', authenticate, controller.changePassword);

router.post('/forgot-password', forgotPasswordLimiter, controller.forgotPassword);
router.get('/verify-reset-token', controller.verifyResetToken);
router.post('/reset-password', controller.resetPassword);

module.exports = router;
