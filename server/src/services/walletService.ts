import { Response, NextFunction } from 'express';
import db from '../models';
import { AuthRequest } from '../middleware/authMiddleware';

export const creditWallet = async (userId: number, amount: number, orderId: number | undefined, description: string) => {
    const user = await db.User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const newBalance = Number(user.walletBalance || 0) + Number(amount);
    await user.update({ walletBalance: newBalance });

    await db.WalletTransaction.create({
        userId,
        orderId,
        amount,
        type: 'Credit',
        description
    });
};

export const debitWallet = async (userId: number, amount: number, orderId: number | undefined, description: string) => {
    const user = await db.User.findByPk(userId);
    if (!user) throw new Error('User not found');

    if (Number(user.walletBalance || 0) < Number(amount)) {
        throw new Error('Insufficient wallet balance');
    }

    const newBalance = Number(user.walletBalance || 0) - Number(amount);
    await user.update({ walletBalance: newBalance });

    await db.WalletTransaction.create({
        userId,
        orderId,
        amount,
        type: 'Debit',
        description
    });
};

export const getWalletData = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const user = await db.User.findByPk(userId, {
            attributes: ['walletBalance']
        });
        const transactions = await db.WalletTransaction.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        res.json({ 
            balance: user?.walletBalance || 0,
            transactions 
        });
    } catch (err) {
        next(err);
    }
};
