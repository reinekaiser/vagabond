import mongoose from "mongoose";

const hotelRoomSchema = new mongoose.Schema(
    {
        bedType: { type: String, required: true },
        serveBreakfast: { type: String},
        maxOfGuest: { type: Number, required: true },
        numberOfRoom: { type: Number, required: true },
        cancellationPolicy: {
            refund: { type: String},
            day: { type: Number },
            percentBeforeDay: { type: Number },
            percentAfterDay: { type: Number},
        },
        price: { type: Number, required: true },
    },
    { timestamps: true }
);


const hotelRoomTypeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        img: [
            { type: String, default: [] }
        ],
        area: { type: String },
        view: { type: String },
        roomFacilities: [
            { type: String, default: [] }
        ],
        rooms: [hotelRoomSchema],
    },
    { timestamps: true }
);

const HotelRoomType = mongoose.model("HotelRoomType", hotelRoomTypeSchema);
export default HotelRoomType;