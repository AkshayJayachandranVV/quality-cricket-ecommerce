import { Request, Response, NextFunction } from 'express';
import db from '../models';

export const createReview = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    const { productId, rating, comment } = req.body;
    const userId = req.userId;

    try {
        const review = await db.Review.create({
            productId: Number(productId),
            userId,
            rating: Number(rating),
            comment
        });

        res.status(201).json({ message: 'Review added successfully', review });
    } catch (err) {
        next(err);
    }
};

export const getReviewsByProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId } = req.params;

    try {
        const reviews = await db.Review.findAll({
            where: { productId: Number(productId) },
            include: [{ model: db.User, as: 'user', attributes: ['firstName', 'lastName'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json({ reviews });
    } catch (err) {
        next(err);
    }
};
