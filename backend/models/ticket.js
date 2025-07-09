import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        subtitle: String,
        description: String,
        prices: [
            {
                priceType: { type: String, required: true },
                notes: String,
                price: { type: Number, required: true },
                minPerBooking: { type: Number },
                maxPerBooking: { type: Number },
            },
        ],
        maxQuantity: {
            type: Number
        },
        numBookings: {
            type: Number,
            default: 0,
        },
        overview: String,
        voucherValidity: String,
        redemptionPolicy: {
            method: String,
            location: String,
        },
        cancellationPolicy: {
            isReschedule: Boolean,
            reschedulePolicy: String,
            isRefund: Boolean,
            refundPolicy: {
                refundPercentage: [{ daysBefore: Number, percent: Number }],
                description: String,
            },
        },
        termsAndConditions: String,
        
    },
    { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
