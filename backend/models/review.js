import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        rating: { type: Number },
        comment: { type: String },
        images: [{ type: String, default: [] }],
        reviewableType: {
            type: String,
            required: true,
            enum: ['Hotel', 'Tour']
        },
        reviewableId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'reviewableType'
        },
    },
    { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;