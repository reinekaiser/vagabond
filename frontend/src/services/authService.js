import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if it exists
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle token expiration
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/sign-in';
        }
        return Promise.reject(error);
    }
);

// Universal login function that tries both user and admin endpoints
export const login = async (email, password) => {
    try {
        // First try user login
        try {
            const userResponse = await axiosInstance.post('/api/users/login', { email, password });
            if (userResponse.data.success) {
                localStorage.setItem('token', userResponse.data.data.token);
                localStorage.setItem('userInfo', JSON.stringify(userResponse.data.data.user));
                return userResponse.data;
            }
        } catch (userError) {
            console.log('User login failed, trying admin login');
        }

        // If user login fails, try admin login
        const adminResponse = await axiosInstance.post('/api/admin/login', { email, password });
        if (adminResponse.data.success) {
            localStorage.setItem('token', adminResponse.data.data.token);
            localStorage.setItem('userInfo', JSON.stringify(adminResponse.data.data.admin));
        }
        return adminResponse.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// User registration
export const register = async (userData) => {
    try {
        // Ensure user role is set
        if (!userData.role) {
            userData.role = 'user';
        }
        
        const response = await axiosInstance.post('/api/users/register', userData);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/sign-in';
};

// Legacy admin login function (kept for backward compatibility)
export const loginAdmin = async (email, password) => {
    try {
        const response = await axiosInstance.post('/api/admin/login', { email, password });
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
        }
        return response.data;
    } catch (error) {
        console.error('Admin login error:', error);
        throw error;
    }
};

// Check if user is admin
export const isAdmin = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
        // Token JWT phải có 3 phần, ngăn lỗi atob
        const parts = token.split('.');
        if (parts.length !== 3) return false;
        // atob chỉ nhận base64url, cần thay thế ký tự nếu có
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        // Thêm padding nếu thiếu
        while (base64.length % 4) base64 += '=';
        const decoded = JSON.parse(atob(base64));
        return decoded.role === 'admin';
    } catch (error) {
        console.error('Token decode error:', error);
        return false;
    }
};

// Check user role from token
export const getUserRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        const decoded = JSON.parse(atob(base64));
        return decoded.role || null;
    } catch (error) {
        console.error('Token decode error:', error);
        return null;
    }
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

// Forgot password
export const forgotPassword = async (email) => {
    try {
        const response = await axiosInstance.post('/api/users/forgot-password', { email });
        return response.data;
    } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
    }
};

// Reset password
export const resetPassword = async (email, code, newPassword) => {
    try {
        const response = await axiosInstance.post('/api/users/reset-password', { 
            email, 
            code, 
            newPassword 
        });
        return response.data;
    } catch (error) {
        console.error('Reset password error:', error);
        throw error;
    }
};

export default {
    login,
    register,
    logout,
    loginAdmin,
    isAdmin,
    isAuthenticated,
    getUserRole,
    forgotPassword,
    resetPassword
};