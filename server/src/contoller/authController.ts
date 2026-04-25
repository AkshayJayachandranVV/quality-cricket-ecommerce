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
import { validate } from '../middleware/validateMiddleware';
import { 
    registerValidation, 
    loginValidation, 
    forgotPasswordValidation, 
    resetPasswordValidation 
} from '../validations/authValidation';

const router: Router = Router();

// POST /api/auth/register
router.post('/register', registerValidation, validate, register);

// POST /api/auth/login
router.post('/login', loginValidation, validate, login);

// POST /api/auth/google-login
router.post('/google-login', googleLogin);

// OTP Routes
router.post('/login-otp-request', requestLoginOtp);
router.post('/login-otp-verify', verifyLoginOtp);
router.post('/register-otp-request', registerValidation, validate, requestRegisterOtp);
router.post('/register-otp-verify', verifyRegisterOtp);

// Forgot Password Routes
router.post('/forgot-password-request', forgotPasswordValidation, validate, forgotPasswordRequest);
router.post('/forgot-password-verify', forgotPasswordVerify);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);

export default router;
