import express from "express";
import { createTourBooking, getMyTourBookings, getBookingsByTour, cancelTourBooking, updateTourBookingStatus, getTourBookings } from "../controllers/tourBookingController.js";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get("/bookings", getTourBookings);
router.route("/").get(protect, getMyTourBookings)
                .post(createTourBooking);
router.get("/tour/:tourId", protect, getBookingsByTour);
router.put("/:id/cancel", cancelTourBooking);
router.put("/:id/status", updateTourBookingStatus);

export default router;
