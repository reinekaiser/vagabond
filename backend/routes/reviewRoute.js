import express from "express";
import {
    addRevirew,
    updateReview,
    deleteReview,
    getReviewsByReviewableId,
    getOrderCanReview,
    getTourOrderCanReview,
    getMyReviews,
    getReviewByCity
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/", getReviewsByReviewableId);
router.get("/my-reviews", getMyReviews);
router.get("/review-city", getReviewByCity)
router.post("/", addRevirew);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);
router.get("/order-can-review", getOrderCanReview);
router.get("/tour-order-can-review", getTourOrderCanReview);

export default router;