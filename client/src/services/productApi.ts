const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        let message = data.message || 'Something went wrong';
        if (response.status === 401 || response.status === 403) {
            if (message.toLowerCase().includes('token') || message.toLowerCase().includes('expired')) {
                message = 'Your session has expired. Please log in again.';
                window.dispatchEvent(new Event('auth-error'));
            } else if (message === 'Admin access required') {
                message = 'You do not have permission to access this area.';
            }
        }
        throw new Error(message);
    }
    return data;
};

export const createProduct = async (formData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // Do NOT set Content-Type header when sending FormData,
            // the browser will set it automatically with the boundary
        },
        body: formData,
    });
    return handleResponse(response);
};

export const getAllProducts = async () => {
    const response = await fetch(`${API_URL}/products`);
    return handleResponse(response);
};

export const getProductById = async (id: number) => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return handleResponse(response);
};

export const deleteProduct = async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const updateProduct = async (id: number, formData: FormData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });
    return handleResponse(response);
};
export const createReview = async (reviewData: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
};

export const getReviewsByProduct = async (productId: number) => {
    const response = await fetch(`${API_URL}/reviews/${productId}`);
    return handleResponse(response);
};
