import { body } from 'express-validator';

export const registerValidation = [
    body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ min: 2 }).withMessage('Name too short'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required').isLength({ min: 10 }).withMessage('Invalid phone number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

export const loginValidation = [
    body('email').trim().isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidation = [
    body('email').trim().isEmail().withMessage('Valid email is required'),
];

export const resetPasswordValidation = [
    body('email').trim().isEmail(),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Invalid OTP format'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];
