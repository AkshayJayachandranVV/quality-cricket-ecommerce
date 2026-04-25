const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        let message = data.message || 'Something went wrong';
        if (response.status === 401 || response.status === 403) {
            if (message.toLowerCase().includes('token') || message.toLowerCase().includes('expired')) {
                message = 'Your session has expired. Please log in again.';
                window.dispatchEvent(new Event('auth-error'));
            }
        }
        throw new Error(message);
    }
    return data;
};

export const getMyAddresses = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const addAddress = async (addressData: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(addressData)
    });
    return handleResponse(response);
};

export const updateAddress = async (id: number, addressData: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/addresses/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(addressData)
    });
    return handleResponse(response);
};

export const deleteAddress = async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};
