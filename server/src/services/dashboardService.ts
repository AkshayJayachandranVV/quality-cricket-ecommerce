import { Request, Response } from 'express';
import db from '../models';
import { Op, fn, col } from 'sequelize';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        // 1. Total Earning (Sum of totalAmount for paid orders)
        const totalEarningResult = await db.Order.sum('totalAmount', {
            where: { paymentStatus: 'Paid' }
        });
        const totalEarning = totalEarningResult || 0;

        // 2. Total Sales (Count of paid orders)
        const totalSales = await db.Order.count({
            where: { paymentStatus: 'Paid' }
        });

        // 3. Total Orders (All orders)
        const totalOrders = await db.Order.count();

        // 4. Total Customers (Users with role 'Customer')
        const totalCustomers = await db.User.count({
            where: { role: 'Customer' }
        });

        // 5. Today Total Sale
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todaySaleResult = await db.Order.sum('totalAmount', {
            where: {
                paymentStatus: 'Paid',
                createdAt: { [Op.gte]: today }
            }
        });
        const todayTotalSale = todaySaleResult || 0;

        // 6. Recent Orders (Top 5)
        const recentOrders = await db.Order.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [
                { model: db.Product, as: 'product' },
                { model: db.User, as: 'user', attributes: ['firstName', 'lastName'] }
            ]
        });

        // 7. Sales History (Last 15 days)
        const last15Days = new Date();
        last15Days.setDate(last15Days.getDate() - 15);
        
        const salesHistory = await db.Order.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'],
                [fn('SUM', col('totalAmount')), 'total']
            ],
            where: {
                paymentStatus: 'Paid',
                createdAt: { [Op.gte]: last15Days }
            },
            group: [fn('DATE', col('createdAt'))],
            order: [[fn('DATE', col('createdAt')), 'ASC']],
            raw: true
        });

        res.json({
            totalEarning,
            totalSales,
            totalOrders,
            totalCustomers,
            todayTotalSale,
            recentOrders,
            salesHistory
        });
    } catch (err) {
        const error = err as Error;
        console.error("Dashboard error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
