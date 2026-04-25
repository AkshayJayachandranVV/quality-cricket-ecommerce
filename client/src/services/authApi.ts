/**
 * Centralized API service for authentication and user-related operations.
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const handleResponse = async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
        let message = data.message || 'Something went wrong';
        
        // Map technical messages to user-friendly ones
        // technical mapping
        if (response.status === 401 || response.status === 403) {
            if (message === 'Admin access required') {
                message = 'You do not have permission to access this area.';
            } else if ((message.toLowerCase().includes('token') || message.toLowerCase().includes('expired')) && !message.toLowerCase().includes('otp')) {
                message = 'Your session has expired. Please log in again.';
                window.dispatchEvent(new Event('auth-error'));
            } else {
                // Keep the server's message (e.g. "Invalid credentials", "Invalid or expired OTP")
                message = data.message || message;
            }
        }
        
        throw new Error(message);
    }
    return data;
};

export const loginEmail = async (formData: any) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    });
    return handleResponse(response);
};

export const googleLoginApi = async (idToken: string) => {
    const response = await fetch(`${API_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
    });
    return handleResponse(response);
};

export const requestLoginOtp = async (phoneNumber: string) => {
    const response = await fetch(`${API_URL}/auth/login-otp-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
    });
    return handleResponse(response);
};

export const verifyLoginOtp = async (phoneNumber: string, otp: string) => {
    const response = await fetch(`${API_URL}/auth/login-otp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
    });
    return handleResponse(response);
};

export const requestRegisterOtp = async (registrationData: any) => {
    const response = await fetch(`${API_URL}/auth/register-otp-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
    });
    return handleResponse(response);
};

export const verifyRegisterOtp = async (userData: any) => {
    const response = await fetch(`${API_URL}/auth/register-otp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

export const forgotPasswordRequest = async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    return handleResponse(response);
};

export const forgotPasswordVerify = async (email: string, otp: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
    });
    return handleResponse(response);
};

export const resetPassword = async (userData: any) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};
export const getAllUsers = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};

export const updateUser = async (id: number, userData: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};

export const deleteUser = async (id: number) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
};
