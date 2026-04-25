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

export const getDashboardStats = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/dashboard/stats`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return handleResponse(response);
};
