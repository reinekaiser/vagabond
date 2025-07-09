import express from "express";
import {
    createHotelCheckoutSession,
    createTourCheckoutSession,
    getStripeBookingStatus,
} from "../controllers/stripeController.js";

const router = express.Router();

router.post("/create-tour-checkout-session", createTourCheckoutSession);
router.get("/booking-status", getStripeBookingStatus);
router.post("/create-hotel-checkout-session", createHotelCheckoutSession);

export default router;
