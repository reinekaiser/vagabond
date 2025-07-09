import HotelBooking from "../models/hotelBooking.js";
import HotelRoomType from "../models/hotelRoomType.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);

const createBooking = async (req, res) => {
    try {
        const { userId, hotelId, roomTypeId, roomId, name, email, phone,
            checkin, checkout, numGuests, numRooms, paymentMethod, totalPrice, bookingStatus } = req.body;

        if (!userId || !hotelId || !roomTypeId || !roomId || !name || !email ||
            !phone || !checkin || !checkout || !numGuests || !numRooms || !totalPrice) {
            return res.status(400).json({ error: "Thiếu thông tin cần thiết" });
        }
        const roomType = await HotelRoomType.findById(roomTypeId);
        if (!roomType) {
            return res.status(404).json({ error: "Loại phòng không tồn tại" });
        }
        const parsedCheckin = dayjs(checkin, 'DD/MM/YYYY').toDate();
        const parsedCheckout = dayjs(checkout, 'DD/MM/YYYY').toDate();
        const newBooking = new HotelBooking({
            userId,
            hotelId,
            roomTypeId,
            roomId,
            name,
            email,
            phone,
            checkin: parsedCheckin,
            checkout: parsedCheckout,
            numGuests,
            numRooms,
            paymentMethod,
            totalPrice,
            bookingStatus: bookingStatus || "pending",
        });
        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const updateBookingStatus = async (req, res) => {
    const { id } = req.params;
    const { bookingStatus } = req.body;

    try {
        const updated = await HotelBooking.findByIdAndUpdate(
            id,
            { bookingStatus },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Booking not found" });
        res.json(updated);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const cancelBooking = async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await HotelBooking.findOne({ _id: id });
        if (!booking) {
            return res.status(403).json({ message: "Không cho phép huỷ" });
        }

        booking.bookingStatus = "cancelled";
        await booking.save();
        res.json({ message: "Huỷ thành công", booking });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const deleteBooking = async (req, res) => {
    const { id } = req.params;

    try {
        const booking = await HotelBooking.findById(id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        await HotelBooking.findByIdAndDelete(id);
        res.json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách booking của user hiện tại
const getMyBookings = async (req, res) => {
    try {
        const bookings = await HotelBooking.find({ userId: req.user._id })
            .populate('hotelId', 'name img')
            .populate('roomTypeId', 'name')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy danh sách booking theo hotel ID
const getBookingsByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { limit = 10, page = 1 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await HotelBooking.find({ hotelId })
            .populate("userId", "firstName lastName email")
            .populate("hotelId", "name address")
            .populate("roomTypeId", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await HotelBooking.countDocuments({ hotelId });

        res.json({
            bookings,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const getHotelBookings = async (req, res) => {
    try {
        const { bookingStatus, page, limit } = req.query;

        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 5;
        const skip = (pageNumber - 1) * pageSize;

        const filter = {};
        if (bookingStatus !== 'all') {
            filter.bookingStatus = bookingStatus;
        }

        const total = await HotelBooking.countDocuments(filter);

        const bookings = await HotelBooking.find(filter)
            .populate('userId', 'firstName lastName')
            .populate('hotelId', 'name')
            .populate('roomTypeId', 'name')
            .skip(skip)
            .limit(pageSize);

        res.json({
            bookings,
            total,
            currentPage: pageNumber,
            pageSize: pageSize,
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server" });
    }
}

export {
    createBooking,
    updateBookingStatus,
    cancelBooking,
    deleteBooking,
    getMyBookings,
    getBookingsByHotel,
    getHotelBookings
};