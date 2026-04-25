import { Request, Response, NextFunction } from 'express';
import db from '../models';

export const getAllUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await db.User.findAll({
            attributes: { exclude: ['passwordHash', 'otp', 'otpExpiry'] }
        });
        res.json({ users });
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { firstName, lastName, role, isVerified, isBlocked } = req.body;

    try {
        const user = await db.User.findByPk(Number(id));
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        await user.update({
            firstName,
            lastName,
            role,
            isVerified,
            isBlocked
        });

        res.json({ message: 'User updated successfully', user });
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const deleted = await db.User.destroy({ where: { id: Number(id) } });
        if (!deleted) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        next(err);
    }
};
