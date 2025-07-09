import fetch from "node-fetch";
import dotenv from "dotenv";
import TourBooking from "../models/tourBooking.js";
import Tour from "../models/tour.js";
import Ticket from "../models/ticket.js";
import mongoose from "mongoose";
import HotelBooking from "../models/hotelBooking.js";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjs.extend(customParseFormat);

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL


const getAccessToken = async () => {
    const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");
    const response = await fetch(
        "https://api-m.sandbox.paypal.com/v1/oauth2/token",
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        }
    );

    const data = await response.json();
    return data.access_token;
};

export const createTourPaypalOrder = async (req, res) => {
    const { amount, tourId } = req.body;
    console.log(req.body);
    if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: "Invalid amount" });
    }
    try {
        const accessToken = await getAccessToken();
        const response = await fetch(
            "https://api-m.sandbox.paypal.com/v2/checkout/orders",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            amount: {
                                currency_code: "USD",
                                value: (amount / 25911.5).toFixed(2),
                            },
                        },
                    ],
                    application_context: {
                        return_url:
                            `${CLIENT_URL}/tour-checkout-success`,
                        cancel_url: `${CLIENT_URL}/tour/${tourId}`,
                    },
                }),
            }
        );

        const data = await response.json();
        const approvalUrl = data.links.find(
            (link) => link.rel === "approve"
        )?.href;
        res.json({ approvalUrl });
    } catch (err) {
        console.error("Error creating PayPal order:", err);
        res.status(500).json({ error: "Không thể tạo paypal order" });
    }
};

export const captureTourPaypalOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { orderID, ...tourBooking } = req.body;
        const accessToken = await getAccessToken();

        const captureRes = await fetch(
            `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const captureData = await captureRes.json();

        if (captureData.status !== "COMPLETED") {
            return res.status(400).json({ error: "Thanh toán chưa hoàn tất" });
        }

        const newTourBooing = new TourBooking(tourBooking);
        await newTourBooing.save({ session });

        await Tour.findByIdAndUpdate(
            tourBooking.tourId,
            {
                $inc: { bookings: 1 },
            },
            { session }
        );

        await Ticket.findByIdAndUpdate(
            tourBooking.ticketId,
            {
                $inc: {
                    bookings: Object.values(tourBooking.quantities).reduce(
                        (sum, quantity) => sum + quantity,
                        0
                    ),
                },
            },
            { session }
        );

        await session.commitTransaction();
        session.endSession();
        return res.json({
            message: "Đã thanh toán, lưu đơn hàng và cập nhật",
            order: newTourBooing,
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("Transaction failed:", err);
        return res
            .status(500)
            .json({ error: "Có lỗi xảy ra khi xử lý thanh toán" });
    }
};

export const createHotelPaypalOrder = async (req, res) => {
    const {
        amount,
        hotelId,
        location,
        checkIn,
        checkOut,
        rooms,
        adults,
        roomTypeId,
        roomId,
    } = req.body;

    if (!amount || isNaN(amount)) {
        return res.status(400).json({ error: "Invalid amount" });
    }

    const queryString = new URLSearchParams({
        location,
        checkIn,
        checkOut,
        rooms,
        adults,
        roomTypeId,
        roomId,
    }).toString();

    const cancelUrl = `${CLIENT_URL}/hotels/${hotelId}?${queryString}`;

    try {
        const accessToken = await getAccessToken();
        const response = await fetch(
            "https://api-m.sandbox.paypal.com/v2/checkout/orders",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            amount: {
                                currency_code: "USD",
                                value: (amount / 25911.5).toFixed(2),
                            },
                        },
                    ],
                    application_context: {
                        return_url:
                            `${CLIENT_URL}/hotel-checkout-success`,
                        cancel_url: cancelUrl,
                    },
                }),
            }
        );

        const data = await response.json();
        const approvalUrl = data.links.find(
            (link) => link.rel === "approve"
        )?.href;
        res.json({ approvalUrl });
    } catch (err) {
        console.error("Error creating PayPal order:", err);
        res.status(500).json({ error: "Không thể tạo paypal order" });
    }
};

export const captureHotelPaypalOrder = async (req, res) => {
    try {
        const { orderID, checkin, checkout, ...hotelBooking } = req.body;
        const accessToken = await getAccessToken();

        const captureRes = await fetch(
            `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const parsedCheckin = dayjs(checkin, "DD/MM/YYYY").toDate();
        const parsedCheckout = dayjs(checkout, "DD/MM/YYYY").toDate();
        const newHotelBooing = new HotelBooking({
            checkin: parsedCheckin,
            checkout: parsedCheckout,
            ...hotelBooking,
        });
        await newHotelBooing.save();

        const captureData = await captureRes.json();

        if (captureData.status !== "COMPLETED") {
            return res.status(400).json({ error: "Thanh toán chưa hoàn tất" });
        }

        return res.json({
            message: "Đã thanh toán và lưu đơn hàng",
            order: newHotelBooing,
        });
    } catch (err) {
        console.error("Có lỗi xảy ra khi xử lý thanh toán:", err);
        return res
            .status(500)
            .json({ error: "Có lỗi xảy ra khi xử lý thanh toán" });
    }
};
