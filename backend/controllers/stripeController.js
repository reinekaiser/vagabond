import Stripe from "stripe";
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
const CLOUDINARY_BASE_URL = "https://res.cloudinary.com/dytiq61hf/image/upload/v1744375449";
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const CLIENT_URL = process.env.CLIENT_URL
const createTourCheckoutSession = async (req, res) => {
    const { ticketName, tourName, quantities, ...tourBooking } =
        req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "vnd",
                        product_data: {
                            name: `${ticketName} - ${tourName}`,
                            images: [tourBooking.tourImg],
                        },
                        unit_amount: tourBooking.totalPrice,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                quantities: JSON.stringify(quantities),
                type: "tour",
                ...tourBooking,
            },
            mode: "payment",
            success_url:
                `${CLIENT_URL}/checkout-stripe-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${CLIENT_URL}/tour/${tourBooking.tourId}`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const createHotelCheckoutSession = async (req, res) => {
    const { hotelName, location, roomTypeName, roomTypeImg, ...hotelBooking } =
        req.body;
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

        console.log(hotelBooking)
        const queryString = new URLSearchParams({
            location,
            checkIn,
            checkOut,
            rooms,
            adults,
            roomTypeId,
            roomId,
        }).toString();
        const cancelUrl = `${CLIENT_URL}/hotels/${hotelBooking.hotelId}?${queryString}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "vnd",
                        product_data: {
                            name: `${hotelName} - ${roomTypeName}`,
                            images: [`${CLOUDINARY_BASE_URL}/${roomTypeImg}`],
                        },
                        unit_amount: hotelBooking.totalPrice,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                type: "hotel",
                ...hotelBooking,
            },
            mode: "payment",
            success_url:
                `${CLIENT_URL}/checkout-stripe-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Error:", error.message);
        res.status(500).json({ error: error.message });
    }
};


const handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const metadata = event.data.object.metadata;

    if (metadata?.type === "hotel") {
        try {
            if (event.type === "checkout.session.completed") {
                const session = event.data.object;
                const { checkin, checkout, ...rest } = session.metadata;
                const parsedCheckin = dayjs(checkin, "DD/MM/YYYY").toDate();
                const parsedCheckout = dayjs(checkout, "DD/MM/YYYY").toDate();
                const newHotelBooking = new HotelBooking({
                    checkin: parsedCheckin,
                    checkout: parsedCheckout,
                    ...rest,
                    stripeSessionId: session.id,
                });
                await newHotelBooking.save({});

                console.log("Thanh toán bằng Stripe thành công");
                return res.status(200).send('ok');
            } else {
                res.status(400).send("Unhandled event type");
            }
        } catch (err) {
            console.error("Transaction failed:", err);
            return res.status(500);
        }
    } else if (metadata?.type === "tour") {
        const mongooseSession = await mongoose.startSession();
        mongooseSession.startTransaction();

        try {
            if (event.type === "checkout.session.completed") {
                const session = event.data.object;
                const newTourBooking = new TourBooking({
                    ...session.metadata,
                    stripeSessionId: session.id,
                });
                await newTourBooking.save({ session: mongooseSession });

                await Tour.findByIdAndUpdate(
                    session.metadata.tourId,
                    {
                        $inc: { bookings: 1 },
                    },
                    { session: mongooseSession }
                );

                const quantities = JSON.parse(session.metadata.quantities);
                const totalBooked = Object.values(quantities).reduce(
                    (sum, quantity) => sum + Number(quantity),
                    0
                );
                await Ticket.findByIdAndUpdate(
                    session.metadata.ticketId,
                    {
                        $inc: {
                            numBookings: totalBooked,
                        },
                    },
                    { session: mongooseSession }
                );

                await mongooseSession.commitTransaction();
                mongooseSession.endSession();
                console.log("Thanh toán bằng Stripe thành công");
                return res.status(200).send();
            } else {
                res.status(400).send("Unhandled event type");
            }
        } catch (err) {
            await mongooseSession.abortTransaction();
            mongooseSession.endSession();
            console.error("Transaction failed:", err);
            return res.status(500);
        }
    }
};

const getStripeBookingStatus = async (req, res) => {
    const sessionId = req.query.session_id
    try {
        const tourBooking = await TourBooking.findOne({
            stripeSessionId: sessionId,
        });

        if (tourBooking) {
            return res.json({
                status: "success",
                type: "tour",
                booking: tourBooking,
            });
        }

        const hotelBooking = await HotelBooking.findOne({
            stripeSessionId: sessionId,
        });

        if (hotelBooking) {
            return res.json({
                status: "success",
                type: "hotel",
                booking: hotelBooking,
            });
        }

        return res.json({ status: "not_found" });
    } catch (error) {
        console.error(error);
        res.json({ status: "error" });
    }
};


export {
    createTourCheckoutSession,
    handleStripeWebhook,
    getStripeBookingStatus,
    createHotelCheckoutSession,
};
