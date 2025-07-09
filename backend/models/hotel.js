import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        img: [{ type: String, default: [] }],
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
        address: { type: String, required: true },
        city: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "City",
            required: true
        },
        rooms: { type: Number, required: true },
        averageRating: { type: Number, default: 0 },
        description: { type: String, required: true },

        serviceFacilities: [
            { type: mongoose.Schema.Types.ObjectId, ref: "HotelFacility" }
        ],

        policies: {
            timeCheckin: { type: String, required: true },
            timeCheckout: { type: String, required: true },
            checkinPolicy: { type: String },
            childrenPolicy: { type: String },
            mandatoryFees: { type: String },
            otherFees: { type: String },
            FoodDrinks: { type: String },
            allowPet: { type: String },
        },

        price: { type: Number},
        roomTypes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "HotelRoomType"
            }
        ],
    },
    { timestamps: true }
);

const Hotel = mongoose.model("Hotel", hotelSchema);
export default Hotel;
