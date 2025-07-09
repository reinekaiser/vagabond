import mongoose from "mongoose";

const hotelBookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            required: true,
        },
        roomTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HotelRoomType",
            required: true,
        },
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        checkin: { type: Date, required: true },
        checkout: { type: Date, required: true },
        numGuests: { type: Number, required: true },
        numRooms: { type: Number, required: true },
        paymentMethod: { type: String },
        totalPrice: { type: Number, required: true },
        bookingStatus: {
            type: String,
            // enum: ["pending", "confirmed", "cancelled"],
            default: "pending",
        },
        isReviewed: {
            type: String,
            // enum: ["yes", "no"],
            default: "no",
        },
        stripeSessionId: String,
    },
    { timestamps: true }
);

const HotelBooking = mongoose.model("HotelBooking", hotelBookingSchema);
export default HotelBooking;
