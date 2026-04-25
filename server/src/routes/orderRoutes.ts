import express from 'express';
import * as orderController from '../contoller/orderController';
import { verifyToken, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// User Routes
router.post('/cart', verifyToken, orderController.addToCart);
router.get('/cart', verifyToken, orderController.getCart);
router.delete('/cart/:id', verifyToken, orderController.removeFromCart);
router.post('/checkout', verifyToken, orderController.createCheckoutSession);
router.post('/verify-payment', verifyToken, orderController.verifyPayment);
router.get('/my-orders', verifyToken, orderController.getMyOrders);
router.post('/cancel/:id', verifyToken, orderController.cancelOrder);
router.post('/return/:id', verifyToken, orderController.returnOrder);
router.post('/checkout-wallet', verifyToken, orderController.placeOrderWithWallet);
router.get('/:id/invoice', verifyToken, orderController.downloadInvoice);

// Admin Routes
router.get('/admin/all', verifyToken, isAdmin, orderController.getAllOrdersAdmin);
router.get('/admin/export', verifyToken, isAdmin, orderController.exportOrdersCsv);
router.put('/admin/status/:id', verifyToken, isAdmin, orderController.updateOrderStatus);

export default router;
