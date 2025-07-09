import mongoose from "mongoose";

const popularQuestion = new mongoose.Schema(
    {
        Question: {type: String, required: true},
        answer: {type: String, required: true}
    }
)

const popularPlaceSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        description: {type: String, required: true},
        img: {type: String, default: ""}
    }
);

const citySchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        description: {type: String, required: true},
        bestTimeToVisit: {type: String, required: true},
        popularPlace: [popularPlaceSchema],
        img: [
            {type: String,default: []}
        ],
        popularQuestion: [popularQuestion],
    },
    { timestamps: true }
);

const City = mongoose.model("City", citySchema);
export default City;