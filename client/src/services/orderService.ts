const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        let message = data.message || 'Something went wrong';
        if (message.toLowerCase().includes('token') || response.status === 401 || response.status === 403) {
            message = 'Your session has expired. Please log in again.';
            window.dispatchEvent(new Event('auth-error'));
        }
        throw new Error(message);
    }
    return data;
};

export const addToCart = async (productId: number, quantity: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity }),
    });
    return handleResponse(response);
};

export const getCart = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const removeFromCart = async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/cart/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const createCheckoutSession = async (checkoutData: { productId: number, quantity: number, shippingAddress: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(checkoutData),
    });
    return handleResponse(response);
};

export const verifyPayment = async (paymentData: { razorpayOrderId: string, razorpayPaymentId: string, signature: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/verify-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData),
    });
    return handleResponse(response);
};

export const getMyOrders = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const getAllOrdersAdmin = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const updateOrderStatus = async (orderId: number, status: string) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/admin/status/${orderId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status }),
    });
    return handleResponse(response);
};

export const cancelOrder = async (orderId: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/cancel/${orderId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return handleResponse(response);
};

export const returnOrder = async (orderId: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/return/${orderId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return handleResponse(response);
};

export const placeOrderWithWallet = async (orderData: { productId: number, quantity: number, shippingAddress: string }) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders/checkout-wallet`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData),
    });
    return handleResponse(response);
};
