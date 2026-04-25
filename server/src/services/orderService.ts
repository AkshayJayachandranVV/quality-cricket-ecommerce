import Razorpay from 'razorpay';
import db from '../models/index';
import { creditWallet, debitWallet } from './walletService';

let rzpInstance: any = null;

const getRazorpay = () => {
    if (!rzpInstance) {
        const key_id = (process.env.RAZORPAY_API_KEY || '').trim();
        const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

        if (!key_id || !key_secret) {
            console.error('❌ Razorpay keys are missing or empty in .env! (RAZORPAY_API_KEY/RAZORPAY_KEY_SECRET)');
            return null;
        }

        console.log(`💳 Initializing Razorpay with Key ID: ${key_id.substring(0, 12)}... (Secret length: ${key_secret.length})`);

        rzpInstance = new Razorpay({
            key_id,
            key_secret,
        });
    }
    return rzpInstance;
};

export const addToCart = async (userId: number, productId: number, quantity: number) => {
    const [cartItem, created] = await db.Cart.findOrCreate({
        where: { userId, productId },
        defaults: { userId, productId, quantity }
    });

    if (!created) {
        cartItem.quantity += quantity;
        await cartItem.save();
    }
    return cartItem;
};

export const getCart = async (userId: number) => {
    return await db.Cart.findAll({
        where: { userId },
        include: [{ model: db.Product, as: 'product' }]
    });
};

export const removeFromCart = async (userId: number, cartId: number) => {
    return await db.Cart.destroy({
        where: { id: cartId, userId }
    });
};

export const createRazorpayOrder = async (userId: number, productId: number, quantity: number, shippingAddress: string) => {
    const product = await db.Product.findByPk(productId);
    if (!product) throw new Error('Product not found');
    
    if (product.stockQuantity < quantity) throw new Error('Insufficient stock');

    const unitPrice = Number(product.basePrice) * (1 - (product.discountPercentage || 0) / 100);
    const amount = unitPrice * quantity;
    
    const rzp = getRazorpay();
    if (!rzp) {
        console.error('❌ Razorpay Instance could not be initialized. Check .env keys.');
        throw new Error('Payment service is currently unavailable');
    }

    const options = {
        amount: Math.round(amount * 100),
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
    };

    console.log('📦 Creating Razorpay Order with options:', options);

    try {
        const rzpOrder = await rzp.orders.create(options);
        console.log('✅ Razorpay Order Created:', rzpOrder.id);

        const order = await db.Order.create({
            userId,
            productId,
            quantity,
            totalAmount: amount,
            status: 'Pending',
            paymentStatus: 'Unpaid',
            razorpayOrderId: rzpOrder.id,
            shippingAddress
        });

        return {
            orderId: order.id,
            razorpayOrderId: rzpOrder.id,
            amount: options.amount,
            currency: options.currency,
            key_id: process.env.RAZORPAY_API_KEY
        };
    } catch (error: any) {
        console.error('❌ Razorpay API Error:', error);
        // Razorpay puts the description inside error.error.description
        const errorMessage = error.error?.description || error.description || error.message || 'Razorpay order creation failed';
        throw new Error(errorMessage);
    }
};

export const verifyPayment = async (razorpayOrderId: string, razorpayPaymentId: string, signature: string) => {
    const crypto = await import('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === signature) {
        const order = await db.Order.findOne({ where: { razorpayOrderId } });
        if (order) {
            order.paymentStatus = 'Paid';
            order.status = 'Processing';
            order.razorpayPaymentId = razorpayPaymentId;
            await order.save();

            const product = await db.Product.findByPk(order.productId);
            if (product) {
                product.stockQuantity -= order.quantity;
                await product.save();
            }

            // Remove from cart after successful order
            await db.Cart.destroy({ where: { userId: order.userId, productId: order.productId } });

            return order;
        }
    }
    throw new Error('Payment verification failed');
};

export const getUserOrders = async (userId: number) => {
    return await db.Order.findAll({
        where: { userId },
        include: [{ model: db.Product, as: 'product' }],
        order: [['createdAt', 'DESC']]
    });
};

export const getAllOrdersAdmin = async () => {
    return await db.Order.findAll({
        include: [
            { model: db.Product, as: 'product' },
            { model: db.User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }
        ],
        order: [['createdAt', 'DESC']]
    });
};

export const updateOrderStatus = async (orderId: number, status: string) => {
    const order = await db.Order.findByPk(orderId);
    if (!order) throw new Error('Order not found');
    order.status = status as any;
    await order.save();
    return order;
};

export const cancelOrder = async (userId: number, orderId: number) => {
    const order = await db.Order.findOne({ where: { id: orderId, userId } });
    if (!order) throw new Error('Order not found');
    
    if (['Delivered', 'Cancelled', 'Returned'].includes(order.status)) {
        throw new Error(`Order cannot be cancelled in state: ${order.status}`);
    }

    const previousStatus = order.status;
    order.status = 'Cancelled';
    await order.save();

    // Refund if it was paid
    if (order.paymentStatus === 'Paid') {
        await creditWallet(userId, Number(order.totalAmount), order.id, `Refund for cancelled order #${order.id}`);
        
        // Restore stock
        const product = await db.Product.findByPk(order.productId);
        if (product) {
            product.stockQuantity += order.quantity;
            await product.save();
        }
    }

    return order;
};

export const returnOrder = async (userId: number, orderId: number) => {
    const order = await db.Order.findOne({ where: { id: orderId, userId } });
    if (!order) throw new Error('Order not found');
    
    if (order.status !== 'Delivered') {
        throw new Error('Only delivered orders can be returned');
    }

    order.status = 'Returned';
    await order.save();

    // Instant refund to wallet
    await creditWallet(userId, Number(order.totalAmount), order.id, `Refund for returned order #${order.id}`);
    
    // Restore stock
    const product = await db.Product.findByPk(order.productId);
    if (product) {
        product.stockQuantity += order.quantity;
        await product.save();
    }

    return order;
};

export const placeOrderWithWallet = async (userId: number, productId: number, quantity: number, shippingAddress: string) => {
    const product = await db.Product.findByPk(productId);
    if (!product) throw new Error('Product not found');
    if (product.stockQuantity < quantity) throw new Error('Insufficient stock');

    const unitPrice = Number(product.basePrice) * (1 - (product.discountPercentage || 0) / 100);
    const amount = unitPrice * quantity;

    // Check wallet balance
    const user = await db.User.findByPk(userId);
    if (!user || Number(user.walletBalance || 0) < amount) {
        throw new Error('Insufficient wallet balance');
    }

    // Create Order directly as Paid
    const order = await db.Order.create({
        userId,
        productId,
        quantity,
        totalAmount: amount,
        status: 'Processing',
        paymentStatus: 'Paid',
        shippingAddress
    });

    // Debit Wallet
    await debitWallet(userId, amount, order.id, `Paid for order #${order.id}`);

    // Reduce stock
    product.stockQuantity -= quantity;
    await product.save();

    // Remove from cart after successful order
    await db.Cart.destroy({ where: { userId, productId } });

    return order;
};
