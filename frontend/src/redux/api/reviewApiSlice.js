import { REVIEW_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const reviewApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getHotelBookingCanReview: builder.query({
            query: (userId) => ({
                url: `${REVIEW_URL}/order-can-review`,
                params: { userId },
            }),
        }),
        getTourBookingCanReview: builder.query({
            query: (userId) => ({
                url: `${REVIEW_URL}/tour-order-can-review`,
                params: { userId },
            }),
        }),
        addReview: builder.mutation({
            query: (review) => ({
                url: `${REVIEW_URL}/`,
                method: "POST",
                body: review,
            }),
        }),
        updateReview: builder.mutation({
            query: ({ id, review }) => ({
                url: `${REVIEW_URL}/${id}`,
                method: "PUT",
                body: review,
            }),
        }),
        deleteReview: builder.mutation({
            query: (id) => ({
                url: `${REVIEW_URL}/${id}`,
                method: "DELETE",
            }),
        }),
        getMyReviews: builder.query({
            query: (userId) => ({
                url: `${REVIEW_URL}/my-reviews`,
                params: { userId },
            }),
        }),
        getReviewByProductId: builder.query({
            query: ({ reviewableId, reviewableType }) => ({
                url: `${REVIEW_URL}/`,
                params: { reviewableId, reviewableType },
            }),
        }),
        getReviewByCity: builder.query({
            query: ({ cityId }) => ({
                url: `${REVIEW_URL}/review-city`,
                params: { cityId },
            }),
        }),
    }),
});

export const {
    useGetHotelBookingCanReviewQuery,
    useGetTourBookingCanReviewQuery,
    useAddReviewMutation,
    useUpdateReviewMutation,
    useDeleteReviewMutation,
    useGetMyReviewsQuery,
    useGetReviewByProductIdQuery,
    useGetReviewByCityQuery,
} = reviewApiSlice;
