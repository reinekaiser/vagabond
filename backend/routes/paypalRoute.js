import express from "express";
import {
    createTourPaypalOrder,
    captureTourPaypalOrder,
    createHotelPaypalOrder,
    captureHotelPaypalOrder,
} from "../controllers/paypalController.js";

const router = express.Router();

router.post("/create-tour-booking", createTourPaypalOrder);
router.post("/capture-tour-booking", captureTourPaypalOrder);
router.post("/create-hotel-booking", createHotelPaypalOrder);
router.post("/capture-hotel-booking", captureHotelPaypalOrder);

export default router;
