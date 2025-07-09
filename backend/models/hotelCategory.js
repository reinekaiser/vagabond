import mongoose from "mongoose";

const hotelCategorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true},
    }
);

const HotelCategory = mongoose.model("HotelCategory", hotelCategorySchema);
export default HotelCategory;