import express from "express";

import { 
    createHotelPayOSLink, 
    createTourPayOSLink, 
    saveSuccessHotelBooking,
    saveSuccessTourBooking
} from "../controllers/payosController.js"

const router = express.Router();

router.post("/create-hotel-checkout-link", createHotelPayOSLink);
router.post("/create-tour-checkout-link", createTourPayOSLink);
router.post("/save-hotel-booking", saveSuccessHotelBooking);
router.post("/save-tour-booking", saveSuccessTourBooking)

export default router;