import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    userId?: number;
    userRole?: string;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access token required' });
        return;
    }

    try {
        const secret = process.env['JWT_SECRET'] as string;
        const decoded = jwt.verify(token, secret) as { id: number; role: string };
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    } catch {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.userRole !== 'Admin') {
        res.status(403).json({ message: 'Admin access required' });
        return;
    }
    next();
};
