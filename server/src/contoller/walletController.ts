import { Router } from 'express';
import { getWalletData } from '../services/walletService';
import { verifyToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', verifyToken, getWalletData);

export default router;
