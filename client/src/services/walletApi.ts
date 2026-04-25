const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Something went wrong');
    return data;
};

export const getWalletData = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/wallet`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return handleResponse(response);
};
