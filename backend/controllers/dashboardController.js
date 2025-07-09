import TourBooking from "../models/tourBooking.js";
import HotelBooking from "../models/hotelBooking.js";
import User from "../models/user.js";
import Tour from "../models/tour.js";
import Hotel from "../models/hotel.js";
import Ticket from "../models/ticket.js";
import mongoose from "mongoose";

// Lấy dữ liệu tổng quan dashboard
export const getDashboardStats = async (req, res) => {
    try {
        const { period = "7" } = req.query; // 7 days, 30 days, 365 days
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Tổng doanh thu từ tour bookings
        const tourRevenue = await TourBooking.aggregate([
            {
                $match: {
                    bookingStatus: "confirmed",
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalPrice" },
                },
            },
        ]);

        // Tổng doanh thu từ hotel bookings
        const hotelRevenue = await HotelBooking.aggregate([
            {
                $match: {
                    bookingStatus: "confirmed",
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalPrice" },
                },
            },
        ]);

        const totalRevenue =
            (tourRevenue[0]?.total || 0) + (hotelRevenue[0]?.total || 0);

        // Thống kê booking tour
        const tourBookingsCount = await TourBooking.countDocuments({
            createdAt: { $gte: startDate },
        });

        // Thống kê booking khách sạn
        const hotelBookingsCount = await HotelBooking.countDocuments({
            createdAt: { $gte: startDate },
        });

        // Số user mới
        const newUsersCount = await User.countDocuments({
            createdAt: { $gte: startDate },
        });

        // Tổng số user
        const totalUsers = await User.countDocuments();

        // Tỷ lệ booking hoàn thành
        const completedTourBookings = await TourBooking.countDocuments({
            bookingStatus: "confirmed",
            createdAt: { $gte: startDate },
        });

        const completedHotelBookings = await HotelBooking.countDocuments({
            bookingStatus: "confirmed",
            createdAt: { $gte: startDate },
        });

        const totalBookings = tourBookingsCount + hotelBookingsCount;
        const completedBookings =
            completedTourBookings + completedHotelBookings;
        const completionRate =
            totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

        // Giá trị booking trung bình
        const avgBookingValue =
            totalBookings > 0 ? totalRevenue / totalBookings : 0;

        // Số lượng tour và hotel
        const totalTours = await Tour.countDocuments();
        const totalHotels = await Hotel.countDocuments();

        res.status(200).json({
            totalRevenue,
            tourBookingsCount,
            hotelBookingsCount,
            totalBookings,
            newUsersCount,
            totalUsers,
            totalTours,
            totalHotels,
            completionRate: parseFloat(completionRate.toFixed(2)),
            avgBookingValue: parseFloat(avgBookingValue.toFixed(2)),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
};

// Lấy dữ liệu biểu đồ doanh thu theo thời gian
export const getRevenueChart = async (req, res) => {
    try {
        const { period = "7" } = req.query;
        const days = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Doanh thu tour theo ngày
        const tourDailyRevenue = await TourBooking.aggregate([
            {
                $match: {
                    bookingStatus: "confirmed",
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    revenue: { $sum: "$totalPrice" },
                    bookings: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
            },
        ]);

        // Doanh thu hotel theo ngày
        const hotelDailyRevenue = await HotelBooking.aggregate([
            {
                $match: {
                    bookingStatus: "confirmed",
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    revenue: { $sum: "$totalPrice" },
                    bookings: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
            },
        ]);

        // Merge dữ liệu
        const chartData = {};

        tourDailyRevenue.forEach((item) => {
            const dateKey = `${item._id.year}-${String(item._id.month).padStart(
                2,
                "0"
            )}-${String(item._id.day).padStart(2, "0")}`;
            chartData[dateKey] = {
                date: dateKey,
                tourRevenue: item.revenue,
                tourBookings: item.bookings,
                hotelRevenue: 0,
                hotelBookings: 0,
            };
        });

        hotelDailyRevenue.forEach((item) => {
            const dateKey = `${item._id.year}-${String(item._id.month).padStart(
                2,
                "0"
            )}-${String(item._id.day).padStart(2, "0")}`;
            if (chartData[dateKey]) {
                chartData[dateKey].hotelRevenue = item.revenue;
                chartData[dateKey].hotelBookings = item.bookings;
            } else {
                chartData[dateKey] = {
                    date: dateKey,
                    tourRevenue: 0,
                    tourBookings: 0,
                    hotelRevenue: item.revenue,
                    hotelBookings: item.bookings,
                };
            }
        });

        // Chuyển về array và sort
        const chartArray = Object.values(chartData).sort(
            (a, b) => new Date(a.date) - new Date(b.date)
        );

        res.status(200).json(chartArray);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
};

// Lấy top tours được book nhiều nhất
export const getTopTours = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const topTours = await TourBooking.aggregate([
            {
                $group: {
                    _id: "$tourId",
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: "$totalPrice" },
                },
            },
            {
                $lookup: {
                    from: "tours",
                    localField: "_id",
                    foreignField: "_id",
                    as: "tourDetails",
                },
            },
            {
                $unwind: "$tourDetails",
            },
            {
                $project: {
                    _id: 1,
                    name: "$tourDetails.name",
                    location: "$tourDetails.location",
                    images: "$tourDetails.images",
                    totalBookings: 1,
                    totalRevenue: 1,
                },
            },
            {
                $sort: { totalBookings: -1 },
            },
            {
                $limit: parseInt(limit),
            },
        ]);

        res.status(200).json(topTours);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
};

// Lấy top hotels được book nhiều nhất
export const getTopHotels = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const topHotels = await HotelBooking.aggregate([
            {
                $group: {
                    _id: "$hotelId",
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: "$totalPrice" },
                },
            },
            {
                $lookup: {
                    from: "hotels",
                    localField: "_id",
                    foreignField: "_id",
                    as: "hotelDetails",
                },
            },
            {
                $unwind: "$hotelDetails",
            },
            {
                $project: {
                    _id: 1,
                    name: "$hotelDetails.name",
                    address: "$hotelDetails.address",
                    img: "$hotelDetails.img",
                    totalBookings: 1,
                    totalRevenue: 1,
                },
            },
            {
                $sort: { totalBookings: -1 },
            },
            {
                $limit: parseInt(limit),
            },
        ]);

        res.status(200).json(topHotels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
};

// Lấy recent bookings
export const getRecentBookings = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Tour bookings
        const recentTourBookings = await TourBooking.find()
            .populate("userId", "firstName lastName email")
            .populate("tourId", "name location")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Hotel bookings
        const recentHotelBookings = await HotelBooking.find()
            .populate("userId", "firstName lastName email")
            .populate("hotelId", "name address")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Merge và sort
        const allBookings = [
            ...recentTourBookings.map((booking) => ({
                _id: booking._id,
                type: "tour",
                customerName:
                    booking.name ||
                    `${booking.userId?.firstName || ""} ${
                        booking.userId?.lastName || ""
                    }`,
                customerEmail: booking.email || booking.userId?.email || "",
                serviceName: booking.tourId?.name || "",
                serviceLocation: booking.tourId?.location || "",
                totalPrice: booking.totalPrice,
                bookingStatus: booking.bookingStatus,
                paymentStatus: "completed", // TourBooking không có paymentStatus riêng
                createdAt: booking.createdAt,
            })),
            ...recentHotelBookings.map((booking) => ({
                _id: booking._id,
                type: "hotel",
                customerName: `${booking.userId?.firstName || ""} ${
                    booking.userId?.lastName || ""
                }`,
                customerEmail: booking.userId?.email || "",
                serviceName: booking.hotelId?.name || "",
                serviceLocation: booking.hotelId?.address || "",
                totalPrice: booking.totalPrice,
                bookingStatus: booking.bookingStatus,
                paymentStatus: booking.paymentStatus,
                createdAt: booking.createdAt,
            })),
        ];

        // Sort by date and limit
        allBookings.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        const recentBookings = allBookings.slice(0, parseInt(limit));

        res.status(200).json(recentBookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
};

// Lấy top customers
export const getTopCustomers = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        // Tour customers
        const tourCustomers = await TourBooking.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalBookings: { $sum: 1 },
                    totalSpent: { $sum: "$totalPrice" },
                },
            },
        ]);

        // Hotel customers
        const hotelCustomers = await HotelBooking.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalBookings: { $sum: 1 },
                    totalSpent: { $sum: "$totalPrice" },
                },
            },
        ]);

        // Merge customer data
        const customerMap = {};

        tourCustomers.forEach((customer) => {
            if (customer._id !== null) {
                customerMap[customer._id] = {
                    userId: customer._id,
                    totalBookings: customer.totalBookings,
                    totalSpent: customer.totalSpent,
                };
            }
        });

        hotelCustomers.forEach((customer) => {
            if (customer._id !== null) {
                if (customerMap[customer._id]) {
                    customerMap[customer._id].totalBookings +=
                        customer.totalBookings;
                    customerMap[customer._id].totalSpent += customer.totalSpent;
                } else {
                    customerMap[customer._id] = {
                        userId: customer._id,
                        totalBookings: customer.totalBookings,
                        totalSpent: customer.totalSpent,
                    };
                }
            }
        });

        // Get user details and sort
        const customerIds = Object.keys(customerMap);
        const users = await User.find({ _id: { $in: customerIds } });

        const topCustomers = users
            .map((user) => ({
                ...customerMap[user._id],
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatar: user.avatar,
            }))
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, parseInt(limit));

        res.status(200).json(topCustomers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
};

// Lấy tất cả bookings (tour + hotel)
export const getAllBookings = async (req, res) => {
    try {
        const { limit = 20, page = 1, status, type } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter object
        let tourFilter = {};
        let hotelFilter = {};

        if (status) {
            tourFilter.bookingStatus = status;
            hotelFilter.bookingStatus = status;
        }

        // Get tour bookings
        let tourBookingsPromise = Promise.resolve([]);
        let tourCountPromise = Promise.resolve(0);

        if (!type || type === "tour") {
            tourBookingsPromise = TourBooking.find(tourFilter)
                .populate("userId", "firstName lastName email")
                .populate("tourId", "name location")
                .populate("ticketId", "title")
                .sort({ createdAt: -1 });

            tourCountPromise = TourBooking.countDocuments(tourFilter);
        }

        // Get hotel bookings
        let hotelBookingsPromise = Promise.resolve([]);
        let hotelCountPromise = Promise.resolve(0);

        if (!type || type === "hotel") {
            hotelBookingsPromise = HotelBooking.find(hotelFilter)
                .populate("userId", "firstName lastName email")
                .populate("hotelId", "name address")
                .populate("roomTypeId", "name")
                .sort({ createdAt: -1 });

            hotelCountPromise = HotelBooking.countDocuments(hotelFilter);
        }

        const [tourBookings, hotelBookings, tourCount, hotelCount] =
            await Promise.all([
                tourBookingsPromise,
                hotelBookingsPromise,
                tourCountPromise,
                hotelCountPromise,
            ]);

        // Merge and format bookings
        const allBookings = [
            ...tourBookings.map((booking) => ({
                _id: booking._id,
                type: "tour",
                customerName:
                    booking.name ||
                    `${booking.userId?.firstName || ""} ${
                        booking.userId?.lastName || ""
                    }`,
                customerEmail: booking.email || booking.userId?.email || "",
                serviceName: booking.tourId?.name || "",
                serviceLocation: booking.tourId?.location || "",
                totalPrice: booking.totalPrice,
                bookingStatus: booking.bookingStatus,
                createdAt: booking.createdAt,
                useDate: booking.useDate,
                ticketType: booking.ticketId?.title || "",
                userId: booking.userId,
                phone: booking.phone,
            })),
            ...hotelBookings.map((booking) => ({
                _id: booking._id,
                type: "hotel",
                customerName: `${booking.userId?.firstName || ""} ${
                    booking.userId?.lastName || ""
                }`,
                customerEmail: booking.userId?.email || "",
                serviceName: booking.hotelId?.name || "",
                serviceLocation: booking.hotelId?.address || "",
                totalPrice: booking.totalPrice,
                bookingStatus: booking.bookingStatus,
                createdAt: booking.createdAt,
                checkin: booking.checkin,
                checkout: booking.checkout,
                numRooms: booking.numRooms,
                numGuests: booking.numGuests,
                roomType: booking.roomTypeId?.name || "",
                userId: booking.userId,
                phone: booking.phone,
            })),
        ];

        // Sort by created date
        allBookings.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Apply pagination
        const total = tourCount + hotelCount;
        const paginatedBookings = allBookings.slice(
            skip,
            skip + parseInt(limit)
        );

        res.status(200).json({
            bookings: paginatedBookings,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit)),
            tourCount,
            hotelCount,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
};

// Debug function để kiểm tra dữ liệu thực tế
export const getDebugData = async (req, res) => {
    try {
        // Lấy tất cả tour bookings
        const allTourBookings = await TourBooking.find().select(
            "bookingStatus totalPrice createdAt name email"
        );

        // Lấy tất cả hotel bookings
        const allHotelBookings = await HotelBooking.find().select(
            "bookingStatus paymentStatus totalPrice createdAt"
        );

        // Thống kê
        const tourStatusCount = {};
        const hotelStatusCount = {};

        allTourBookings.forEach((booking) => {
            tourStatusCount[booking.bookingStatus] =
                (tourStatusCount[booking.bookingStatus] || 0) + 1;
        });

        allHotelBookings.forEach((booking) => {
            hotelStatusCount[booking.bookingStatus] =
                (hotelStatusCount[booking.bookingStatus] || 0) + 1;
        });

        res.status(200).json({
            tourBookingsTotal: allTourBookings.length,
            hotelBookingsTotal: allHotelBookings.length,
            tourStatusCount,
            hotelStatusCount,
            sampleTourBookings: allTourBookings.slice(0, 3),
            sampleHotelBookings: allHotelBookings.slice(0, 3),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
};
