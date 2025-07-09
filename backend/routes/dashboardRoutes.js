import express from "express";
import {
    getDashboardStats,
    getRevenueChart,
    getTopTours,
    getTopHotels,
    getRecentBookings,
    getTopCustomers,
    getDebugData,
    getAllBookings
} from "../controllers/dashboardController.js";
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Thêm middleware protect cho tất cả routes
router.use(protect);

// Lấy thống kê tổng quan
router.get("/stats", getDashboardStats);

// Lấy dữ liệu biểu đồ doanh thu
router.get("/revenue-chart", getRevenueChart);

// Lấy top tours
router.get("/top-tours", getTopTours);

// Lấy top hotels
router.get("/top-hotels", getTopHotels);

// Lấy booking gần đây
router.get("/recent-bookings", getRecentBookings);

// Lấy top customers
router.get("/top-customers", getTopCustomers);

// Lấy tất cả các booking
router.get("/all-bookings", getAllBookings);

// Debug endpoint
router.get("/debug", getDebugData);

export default router; 