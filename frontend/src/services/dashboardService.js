import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
};

const dashboardService = {
    // Lấy thống kê tổng quan
    getDashboardStats: async (period = '7') => {
        try {
            const response = await axios.get(`${API_URL}/api/dashboard/stats?period=${period}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy dữ liệu biểu đồ doanh thu
    getRevenueChart: async (period = '7') => {
        try {
            const response = await axios.get(`${API_URL}/api/dashboard/revenue-chart?period=${period}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy top tours
    getTopTours: async (limit = 5) => {
        try {
            const response = await axios.get(`${API_URL}/api/dashboard/top-tours?limit=${limit}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy top hotels
    getTopHotels: async (limit = 5) => {
        try {
            const response = await axios.get(`${API_URL}/api/dashboard/top-hotels?limit=${limit}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy booking gần đây
    getRecentBookings: async (limit = 10) => {
        try {
            const response = await axios.get(`${API_URL}/api/dashboard/recent-bookings?limit=${limit}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy top customers
    getTopCustomers: async (limit = 5) => {
        try {
            const response = await axios.get(`${API_URL}/api/dashboard/top-customers?limit=${limit}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy thông tin user theo ID
    getUserById: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/api/users/${userId}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy thông tin tour theo ID
    getTourById: async (tourId) => {
        try {
            const response = await axios.get(`${API_URL}/api/tour/${tourId}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy danh sách booking theo tour ID
    getBookingsByTour: async (tourId, limit = 10, page = 1) => {
        try {
            const response = await axios.get(`${API_URL}/api/tourBooking/tour/${tourId}?limit=${limit}&page=${page}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy danh sách booking theo hotel ID
    getBookingsByHotel: async (hotelId, limit = 10, page = 1) => {
        try {
            const response = await axios.get(`${API_URL}/api/hotelBooking/hotel/${hotelId}?limit=${limit}&page=${page}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy tất cả bookings (tour + hotel)
    getAllBookings: async (limit = 20, page = 1, status = '', type = '') => {
        try {
            let url = `${API_URL}/api/dashboard/all-bookings?limit=${limit}&page=${page}`;
            if (status) url += `&status=${status}`;
            if (type) url += `&type=${type}`;
            
            const response = await axios.get(url, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default dashboardService; 