const express = require('express');
const router = express.Router();
const {
  register,
  registerRequestOtp,
  registerVerifyOtp,
  resendRegisterOtp,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  forgotPasswordOtp,
  resetPasswordOtp,
  resetPassword,
  addAddress,
  updateAddress,
  deleteAddress,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Registration with OTP
router.post('/register', register);
router.post('/register-request-otp', registerRequestOtp);
router.post('/register-verify-otp', registerVerifyOtp);
router.post('/resend-register-otp', resendRegisterOtp);

// Login & Logout
router.post('/login', login);
router.post('/logout', logout);

// Forgot & Reset Password with OTP
router.post('/forgot-password', forgotPassword);
router.post('/forgot-password-otp', forgotPasswordOtp);
router.post('/reset-password-otp', resetPasswordOtp);
router.put('/reset-password/:token', resetPassword);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);

// Addresses
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

module.exports = router;
