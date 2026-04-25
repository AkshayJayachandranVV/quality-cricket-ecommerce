import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import * as orderService from '../services/orderService';
import { generateInvoice } from '../services/invoiceService';
import { jsonToCsv } from '../utils/csvHelper';

export const exportOrdersCsv = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await orderService.getAllOrdersAdmin();
        const flatOrders = orders.map((o: any) => ({
            ID: o.id,
            Date: new Date(o.createdAt).toLocaleDateString(),
            Customer: `${o.user?.firstName} ${o.user?.lastName}`,
            Product: o.product?.name,
            Quantity: o.quantity,
            Total: o.totalAmount,
            Status: o.status,
            Payment: o.paymentStatus
        }));

        const csv = jsonToCsv(flatOrders);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=orders_report.csv');
        res.status(200).send(csv);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const downloadInvoice = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await generateInvoice(Number(id), res);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        const cartItem = await orderService.addToCart(req.userId!, productId, quantity || 1);
        res.status(201).json({ message: 'Added to cart', cartItem });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getCart = async (req: AuthRequest, res: Response) => {
    try {
        const cart = await orderService.getCart(req.userId!);
        res.status(200).json(cart);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const removeFromCart = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await orderService.removeFromCart(req.userId!, Number(id));
        res.status(200).json({ message: 'Removed from cart' });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity, shippingAddress } = req.body;
        const session = await orderService.createRazorpayOrder(req.userId!, productId, quantity || 1, shippingAddress);
        res.status(201).json(session);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
        const order = await orderService.verifyPayment(razorpayOrderId, razorpayPaymentId, signature);
        res.status(200).json({ message: 'Payment verified', order });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await orderService.getUserOrders(req.userId!);
        res.status(200).json(orders);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getAllOrdersAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const orders = await orderService.getAllOrdersAdmin();
        res.status(200).json(orders);
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await orderService.updateOrderStatus(Number(id), status);
        res.status(200).json({ message: 'Order status updated', order });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const order = await orderService.cancelOrder(req.userId!, Number(id));
        res.status(200).json({ message: 'Order cancelled successfully', order });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const returnOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const order = await orderService.returnOrder(req.userId!, Number(id));
        res.status(200).json({ message: 'Order return processed', order });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const placeOrderWithWallet = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity, shippingAddress } = req.body;
        const order = await orderService.placeOrderWithWallet(req.userId!, productId, quantity || 1, shippingAddress);
        res.status(201).json({ message: 'Order placed using wallet', order });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};
