import dotenv from "dotenv";
import TourBooking from "../models/tourBooking.js";
import Tour from "../models/tour.js";
import Ticket from "../models/ticket.js";
import mongoose from "mongoose";
import HotelBooking from "../models/hotelBooking.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);
import PayOS from "@payos/node";

dotenv.config();

const CLIENT_ID = process.env.PAYOS_CLIENT_ID
const API_KEY = process.env.PAYOS_API_KEY
const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY
const APP_URL = process.env.CLIENT_URL // 'http://localhost:5173'

const payOS = new PayOS(
    CLIENT_ID,
    API_KEY,
    CHECKSUM_KEY
);


export const createHotelPayOSLink = async (req, res) => {
    const { hotelName, location, roomTypeName, roomTypeImg, ...hotelBooking } = req.body;

    try {
        const {
            location,
            checkin: checkIn,
            checkout: checkOut,
            numRooms: rooms,
            numGuests: adults,
            roomTypeId,
            roomId,
        } = hotelBooking;

        const queryString = new URLSearchParams({
            location,
            checkIn,
            checkOut,
            rooms,
            adults,
            roomTypeId,
            roomId,
        }).toString();
        const cancelUrl = `${APP_URL}/hotels/${hotelBooking.hotelId}?${queryString}`;

        const orderCode = Number(String(Date.now()).slice(-6));

        const paymentLinkRes = await payOS.createPaymentLink({
            orderCode,
            amount: 10000, //hotelBooking.totalPrice
            description: `Thanh toan hotel`,
            items: [
                {
                    name: `${hotelName} - ${roomTypeName}`,
                    quantity: Number(rooms),
                    price: hotelBooking.totalPrice,
                },
            ],
            returnUrl: `${APP_URL}/hotel-checkout-payos-success?orderCode=${orderCode}`,
            cancelUrl: cancelUrl
        });

        res.json({ checkoutUrl: paymentLinkRes.checkoutUrl })
    } catch (error) {
        console.error("Error creating PayOs order:", error.response?.data || error);
        res.status(500).json({ error: "Không thể tạo PayOs order" });
    }
}

export const createTourPayOSLink = async (req, res) => {
    const { ticketName, tourName, quantities, ...tourBooking } =
        req.body;

    try {
        const orderCode = Number(String(Date.now()).slice(-6));
        const paymentLinkRes = await payOS.createPaymentLink({
            orderCode,
            amount: 10000, //tourBooking.totalPrice
            description: `Thanh toan tour`,
            items: [
                {
                    name: `${ticketName} - ${tourName}`,
                    quantity: 1,
                    price: tourBooking.totalPrice,
                },
            ],
            returnUrl: `${APP_URL}/tour-checkout-payos-success?orderCode=${orderCode}`,
            cancelUrl: `${APP_URL}/tour/${tourBooking.tourId}`
        });
        res.json({ checkoutUrl: paymentLinkRes.checkoutUrl })
    } catch (error) {
        console.error("PayOs Error:", error.message);
        res.status(500).json({ error: error.message });
    }
}

export const saveSuccessHotelBooking = async (req, res) => {
    const { orderCode, bookingData } = req.body;

    try {
        const existing = await HotelBooking.findOne({ stripeSessionId: orderCode });
        if (existing) {
            return res.status(200).json({ message: "Booking already saved", data: existing });
        }

        const paymentInfo = await payOS.getPaymentLinkInformation(orderCode);
        if (paymentInfo.status === 'PAID') {
            const { checkin, checkout, ...rest } = bookingData;
            const parsedCheckin = dayjs(checkin, "DD/MM/YYYY").toDate();
            const parsedCheckout = dayjs(checkout, "DD/MM/YYYY").toDate();
            const newHotelBooking = new HotelBooking({
                checkin: parsedCheckin,
                checkout: parsedCheckout,
                ...rest,
                stripeSessionId: orderCode
            })
            const savedBooking = await newHotelBooking.save();
            console.log("Thanh toán thành công");
            return res.status(200).json(savedBooking);
        }
        else {
            res.status(400).send("Unhandled event type");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Lỗi xác nhận thanh toán' });
    }
}

export const saveSuccessTourBooking = async (req, res) => {
    const { orderCode, bookingData } = req.body;
    try {
        const existing = await TourBooking.findOne({ stripeSessionId: orderCode });
        if (existing) {
            return res.status(200).json({ message: "Booking already saved", data: existing });
        }

        const paymentInfo = await payOS.getPaymentLinkInformation(orderCode);
        if (paymentInfo.status === 'PAID') {
            const newTourBooking = new TourBooking({
                ...bookingData,
                stripeSessionId: orderCode
            })
            const saved = await newTourBooking.save();
            console.log("Thanh toán thành công");
            return res.status(200).json(saved);
        }
        else {
            res.status(400).send("Unhandled event type");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Lỗi xác nhận thanh toán' });
    }
}