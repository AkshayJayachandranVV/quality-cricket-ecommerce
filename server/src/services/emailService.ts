import nodemailer from 'nodemailer';

/**
 * Email Service for sending verification codes and other notifications.
 */

const transporter = nodemailer.createTransport({
    host: process.env['EMAIL_HOST'] || 'smtp.gmail.com',
    port: parseInt(process.env['EMAIL_PORT'] || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env['EMAIL_USER'],
        pass: process.env['EMAIL_PASS'],
    },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string): Promise<boolean> => {
    try {
        const info = await transporter.sendMail({
            from: `"Quality Cricket" <${process.env['EMAIL_USER'] || 'your-email@gmail.com'}>`,
            to,
            subject,
            text,
            html,
        });

        console.log('Email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
};

export const sendForgotPasswordOtp = async (email: string, otp: string): Promise<boolean> => {
    const subject = 'Your Password Reset OTP - Quality Cricket';
    const text = `Your OTP for resetting your password is: ${otp}. It is valid for 5 minutes.`;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #4361ee;">Password Reset Request</h2>
            <p>You requested to reset your password for your Quality Cricket account.</p>
            <p>Use the following OTP to proceed:</p>
            <div style="font-size: 24px; font-weight: bold; color: #1a1a2e; margin: 20px 0;">${otp}</div>
            <p>This code is valid for <strong>5 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </div>
    `;
    return sendEmail(email, subject, text, html);
};

export const sendContactMessage = async (name: string, email: string, contact: string, message: string): Promise<boolean> => {
    const subject = `New Contact Form Submission from ${name}`;
    const text = `
        Name: ${name}
        Email: ${email}
        Contact: ${contact}
        Message: ${message}
    `;
    const html = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #3F51B5;">New Contact Request</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Contact:</strong> ${contact}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
        </div>
    `;
    return sendEmail(process.env['SUPPORT_EMAIL'] as string, subject, text, html);
};
