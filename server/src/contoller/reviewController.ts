import { Router } from 'express';
import { createReview, getReviewsByProduct } from '../services/reviewService';
import { verifyToken } from '../middleware/authMiddleware';

const router: Router = Router();

router.get('/:productId', getReviewsByProduct);
router.post('/', verifyToken, createReview);

export default router;
