import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import db from '../models';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { idToken } = req.body;

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ message: 'Invalid Google token' });
            return;
        }

        const { email, given_name, family_name, picture } = payload;

        let user = await db.User.findOne({ where: { email } });

        if (!user) {
            // Create new social user
            user = await db.User.create({
                email,
                firstName: given_name || 'User',
                lastName: family_name || '',
                passwordHash: '', // Social login users don't have passwords
                phoneNumber: '', // Can be updated later
                isVerified: true,
                role: 'Customer',
            });
        }

        if (user.isBlocked) {
            res.status(403).json({ message: 'Your account is blocked. Please contact support.' });
            return;
        }

        const secret = process.env['JWT_SECRET'] as string;
        const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '7d' });

        res.json({
            message: 'Social login successful',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        next(err);
    }
};
import { sendOtp } from '../utils/SmsSender';
import { sendForgotPasswordOtp } from './emailService';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { firstName, lastName, email, phoneNumber, password } = req.body as {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        password: string;
    };

    try {
        const existing = await db.User.findOne({ where: { email } });
        if (existing) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await db.User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            passwordHash,
            role: 'Customer',
        });

        res.status(201).json({ message: 'Registration successful', userId: user.id });
    } catch (err) {
        next(err);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body as { email: string; password: string };

    try {
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (user.isBlocked) {
            res.status(403).json({ message: 'Your account is blocked. Please contact support.' });
            return;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const secret = process.env['JWT_SECRET'] as string;
        const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        next(err);
    }
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const forgotPasswordRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email } = req.body as { email: string };

    try {
        const user = await db.User.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({ message: 'User not found with this email' });
            return;
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await user.update({ otp, otpExpiry });

        await sendForgotPasswordOtp(email, otp);
        res.json({ message: 'OTP sent to your email' });
    } catch (err) {
        next(err);
    }
};

export const forgotPasswordVerify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, otp } = req.body as { email: string; otp: string };

    try {
        const user = await db.User.findOne({ where: { email } });
        if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
            res.status(401).json({ message: 'Invalid or expired OTP' });
            return;
        }

        res.json({ message: 'OTP verified successfully' });
    } catch (err) {
        next(err);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, otp, newPassword } = req.body as { email: string; otp: string; newPassword: string };

    try {
        const user = await db.User.findOne({ where: { email } });
        if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
            res.status(401).json({ message: 'Session expired. Please request OTP again.' });
            return;
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await user.update({ passwordHash, otp: null, otpExpiry: null });

        res.json({ message: 'Password reset successful' });
    } catch (err) {
        next(err);
    }
};

export const requestLoginOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { phoneNumber } = req.body as { phoneNumber: string };

    try {
        const user = await db.User.findOne({ where: { phoneNumber } });
        if (!user) {
            res.status(404).json({ message: 'User not found with this mobile number' });
            return;
        }

        if (user.isBlocked) {
            res.status(403).json({ message: 'Your account is blocked. Please contact support.' });
            return;
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await user.update({ otp, otpExpiry });

        await sendOtp(phoneNumber, otp);
        res.json({ message: 'OTP sent successfully' });
    } catch (err) {
        next(err);
    }
};

export const verifyLoginOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { phoneNumber, otp } = req.body as { phoneNumber: string; otp: string };

    try {
        const user = await db.User.findOne({ where: { phoneNumber } });
        if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
            res.status(401).json({ message: 'Invalid or expired OTP' });
            return;
        }

        if (user.isBlocked) {
            res.status(403).json({ message: 'Your account is blocked. Please contact support.' });
            return;
        }

        // Clear OTP after successful verify
        await user.update({ otp: null, otpExpiry: null });

        const secret = process.env['JWT_SECRET'] as string;
        const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        next(err);
    }
};

export const requestRegisterOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log("hyyyyyy")
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    try {
        const existingUser = await db.User.findOne({ where: { email } });

        if (existingUser && existingUser.isVerified) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }

        const existingPhone = await db.User.findOne({ where: { phoneNumber } });
        if (existingPhone && existingPhone.isVerified) {
            res.status(400).json({ message: 'Phone number already registered' });
            return;
        }

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        const passwordHash = await bcrypt.hash(password, 10);

        if (existingUser) {
            console.log("Updating existing unverified user:", email);
            // Update existing unverified user
            await existingUser.update({
                firstName,
                lastName,
                phoneNumber,
                passwordHash,
                otp,
                otpExpiry
            });
        } else {
            console.log("Creating new unverified user:", email);
            // Create new unverified user
            await db.User.create({
                firstName,
                lastName,
                email,
                phoneNumber,
                passwordHash,
                otp,
                otpExpiry,
                isVerified: false,
                role: 'Customer',
            });
        }

        console.log("Sending OTP to:", phoneNumber);
        await sendOtp(phoneNumber, otp);
        console.log("OTP sent successfully");

        res.json({ message: 'OTP sent successfully' });
    } catch (err) {
        next(err);
    }
};

export const verifyRegisterOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, otp } = req.body;

    try {
        const user = await db.User.findOne({ where: { email } });

        if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
            res.status(401).json({ message: 'Invalid or expired OTP' });
            return;
        }

        await user.update({
            isVerified: true,
            otp: null,
            otpExpiry: null
        });

        const secret = process.env['JWT_SECRET'] as string;
        const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        next(err);
    }
};
