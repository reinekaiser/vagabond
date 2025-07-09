import HotelBooking from "../models/hotelBooking.js";
import Review from "../models/review.js";
import TourBooking from "../models/tourBooking.js";
import cloudinary from "../utils/cloudinary.js";
import Tour from "../models/tour.js";
import Hotel from "../models/hotel.js";

const addRevirew = async (req, res) => {
    try {
        const { userId, rating, comment, images, reviewableType, reviewableId, bookingId } =
            req.body;
        if (!userId || !rating || !reviewableType || !reviewableId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const newReview = Review({
            userId,
            rating,
            comment: comment || "",
            images: images || [],
            reviewableType,
            reviewableId,
        });
        await newReview.save();

        if (reviewableType === "Hotel") {
            const booking = await HotelBooking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }
            booking.isReviewed = "yes";
            await booking.save();
        }

        if (reviewableType === "Tour") {
            const booking = await TourBooking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }
            booking.isReviewed = "yes";
            await booking.save();
        }
        const allReviews = await Review.find({ reviewableType, reviewableId });
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / allReviews.length;
        if (reviewableType === "Hotel") {
            await Hotel.findByIdAndUpdate(reviewableId, {
                averageRating: avgRating,
            });
        }
        if (reviewableType === "Tour") {
            await Tour.findByIdAndUpdate(reviewableId, {
                avgRating: avgRating,
            });
        }

        res.status(201).json(newReview);
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, images } = req.body;

        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;
        if (images !== undefined) review.images = images;

        await review.save();

        res.status(200).json(review);
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        //xoá ảnh
        if (review.images && review.images.length > 0) {
            for (const publicId of review.images) {
                await cloudinary.uploader.destroy(publicId);
            }
        }

        await Review.findByIdAndDelete(id);

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getReviewsByReviewableId = async (req, res) => {
    try {
        const { reviewableId, reviewableType } = req.query;

        if (!reviewableId || !reviewableType) {
            return res.status(400).json({ message: "Missing reviewableId or reviewableType" });
        }

        const reviews = await Review.find({
            reviewableId,
            reviewableType,
        }).populate("userId", "firstName lastName email profilePicture");
        // .populate({
        //     path: 'reviewableId',
        //     select: 'name',
        //     model: reviewableType // e.g., "Hotel"
        // });

        let avgRating = 0;
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
            avgRating = totalRating / reviews.length;
        }

        res.status(200).json({
            averageRating: avgRating,
            reviews,
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getOrderCanReview = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: "Missing userId" });
        }

        const today = new Date();

        const bookings = await HotelBooking.find({
            userId,
            bookingStatus: { $nin: ["pending", "cancelled"] },
            isReviewed: { $ne: "yes" },
            checkout: { $lte: today },
        }).populate("hotelId", "name img");

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching orders for review:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getTourOrderCanReview = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: "Missing userId" });
        }

        const today = new Date(2025, 5, 10);

        const tourBookings = await TourBooking.find({
            userId,
            bookingStatus: { $nin: ["pending", "cancelled"] },
            isReviewed: { $ne: "yes" },
            useDate: { $lte: today },
        }).populate("tourId", "name images");

        res.status(200).json(tourBookings);
    } catch (error) {
        console.error("Error fetching tour orders for review:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getMyReviews = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: "Missing userId" });
        }

        const reviews = await Review.find({ userId })
            .populate("reviewableId", "name")
            .populate("userId", "firstName lastName profilePicture");

        res.status(200).json(reviews);
    } catch (error) {
        console.error("Error fetching my reviews:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getReviewByCity = async (req, res) => {
    try {
        console.log(req.query.cityId);
        const tours = await Tour.find({
            city: req.query.cityId,
        }).select("_id name");

        const tourMap = new Map();
        const tourIds = tours.map((t) => {
            tourMap.set(t._id.toString(), {name: t.name, id: t._id} ); // để tra ngược tên sau này
            return t._id;
        });
        console.log(tours);
        const reviews = await Review.find({
            reviewableId: { $in: tourIds },
            reviewableType: "Tour",
        }).populate("userId", "firstName lastName email profilePicture");

        const result = reviews.map((r) => ({
            tour: tourMap.get(r.reviewableId.toString()), // tra tên tour từ map
            review: {
                _id: r._id,
                rating: r.rating,
                content: r.comment,
                createdAt: r.createdAt,
                images: r.images,
            },
            user: r.userId,
        }));

        const latestByUser = new Map();

        for (const item of result) {
            const userId = item.user._id;
            const existing = latestByUser.get(userId);

            if (!existing || new Date(item.review.createdAt) > new Date(existing.review.createdAt)) {
                latestByUser.set(userId, item);
            }
        }

        const latestReview = Array.from(latestByUser.values()).slice(0, 4);
        res.status(200).json({ success: true, data: latestReview });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    addRevirew,
    updateReview,
    deleteReview,
    getReviewsByReviewableId,
    getOrderCanReview,
    getTourOrderCanReview,
    getMyReviews,
    getReviewByCity,
};
