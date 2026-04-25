import { Request, Response, Router } from 'express';
import { sendContactMessage } from '../services/emailService';

const router = Router();

/**
 * Handle Contact Us form submissions
 * POST /api/contact
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        const { fullName, email, contact, message } = req.body;

        if (!fullName || !email || !message) {
            return res.status(400).json({ message: 'Full Name, Email and Message are required' });
        }

        const success = await sendContactMessage(fullName, email, contact || 'Not provided', message);

        if (success) {
            res.status(200).json({ message: 'Message sent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send message. Please try again later.' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
