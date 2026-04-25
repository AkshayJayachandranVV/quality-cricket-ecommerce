import { Router } from 'express';
import { 
    register, 
    login, 
    requestLoginOtp, 
    verifyLoginOtp, 
    requestRegisterOtp, 
    verifyRegisterOtp,
    forgotPasswordRequest,
    forgotPasswordVerify,
    resetPassword,
    googleLogin
} from '../services/authService';

const router: Router = Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);
router.post('/google-login', googleLogin);

// OTP Routes
router.post('/login-otp-request', requestLoginOtp);
router.post('/login-otp-verify', verifyLoginOtp);
router.post('/register-otp-request', requestRegisterOtp);
router.post('/register-otp-verify', verifyRegisterOtp);

// Forgot Password Routes
router.post('/forgot-password-request', forgotPasswordRequest);
router.post('/forgot-password-verify', forgotPasswordVerify);
router.post('/reset-password', resetPassword);

export default router;
