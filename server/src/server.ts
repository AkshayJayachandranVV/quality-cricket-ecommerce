import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import db from './models';

import authRoutes from './contoller/authController';
import productRoutes from './contoller/productController';
import userRoutes from './contoller/userController';
import reviewRoutes from './contoller/reviewController';
import orderRoutes from './routes/orderRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import addressRoutes from './contoller/addressController';
import walletRoutes from './contoller/walletController';
import contactRoutes from './contoller/contactController';
import faqRoutes from './routes/faqRoutes';
import { verifyToken, isAdmin } from './middleware/authMiddleware';

const app: Application = express();
const PORT = process.env['PORT'] || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic Route
app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'QualityCricket Backend API is running!' });
});

import { getDashboardStats } from './services/dashboardService';

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/faqs', faqRoutes);
app.get('/api/dashboard/stats', verifyToken, isAdmin, getDashboardStats);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middleware
import { errorHandler } from './middleware/errorMiddleware';
app.use(errorHandler);

// Sync Database and Start Server
db.sequelize.sync({ force: false })
    .then(() => {
        console.log('✅ MySQL Database synced successfully');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err: Error) => {
        console.log(err)
        console.error('❌ Failed to sync database:', err.message);
    });

export default app;
