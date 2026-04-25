import express from 'express';
import * as faqController from '../contoller/faqController';
import { verifyToken, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', faqController.getFaqs);
router.post('/', verifyToken, isAdmin, faqController.createFaq);
router.put('/:id', verifyToken, isAdmin, faqController.updateFaq);
router.delete('/:id', verifyToken, isAdmin, faqController.deleteFaq);

export default router;
