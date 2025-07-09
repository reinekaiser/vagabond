import mongoose from "mongoose";

const tourBookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        tourId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tour",
            required: true,
        },
        tourImg: String,
        ticketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
            required: true,
        },
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        useDate: { type: Date, required: true },
        bookingItems: {
            type: Object
        },
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
            default: "no"
        },
        stripeSessionId: String
    },
    { timestamps: true }
);

const TourBooking = mongoose.model("TourBooking", tourBookingSchema);
export default TourBooking;
