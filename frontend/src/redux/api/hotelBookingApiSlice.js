import { HOTEL_BOOKING_URL, PAYOS_URL, PAYPAL_URL, STRIPE_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const hotelBookingApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMyHotelBookings: builder.query({
            query: () => {
                const token = localStorage.getItem("token");
                return {
                    url: `${HOTEL_BOOKING_URL}/`,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
            },
        }),
        cancelBooking: builder.mutation({
            query: (id) => ({
                url: `${HOTEL_BOOKING_URL}/${id}/cancel`,
                method: "PUT",
            }),
        }),
        createBooking: builder.mutation({
            query: (bookingData) => ({
                url: `${HOTEL_BOOKING_URL}/`,
                method: "POST",
                body: bookingData,
            }),
        }),
        captureHotelPaypalOrderAndSaveHotelBooking: builder.mutation({
            query: (bookingData) => ({
                url: `${PAYPAL_URL}/capture-hotel-booking`,
                method: "POST",
                body: bookingData,
            }),
        }),
        createHotelPaypalOrder: builder.mutation({
            query: (paypalOrder) => ({
                url: `${PAYPAL_URL}/create-hotel-booking`,
                method: "POST",
                body: paypalOrder,
            }),
        }),
        createHotelCheckoutSession: builder.mutation({
            query: (bookingData) => ({
                url: `${STRIPE_URL}/create-hotel-checkout-session`,
                method: "POST",
                body: bookingData,
            }),
        }),
        updateHotelBookingStatus: builder.mutation({
            query: ({ id, bookingStatus }) => ({
                url: `${HOTEL_BOOKING_URL}/${id}/status`,
                method: "PUT",
                body: { bookingStatus },
            }),
        }),
        getHotelBookings: builder.query({
            query: (params = {}) => ({
                url: `${HOTEL_BOOKING_URL}/bookings`,
                params,
            }),
        }),
        createHotelPayOSLink: builder.mutation({
            query: (bookingData) => ({
                url: `${PAYOS_URL}/create-hotel-checkout-link`,
                method: "POST",
                body: bookingData,
            }),
        }),
        saveHotelBooking: builder.mutation({
            query: ({ orderCode, bookingData }) => ({
                url: `${PAYOS_URL}/save-hotel-booking`,
                method: "POST",
                body: {
                    orderCode,
                    bookingData,
                },
            })
        })
    }),
});

export const {
    useGetMyHotelBookingsQuery,
    useCancelBookingMutation,
    useCreateBookingMutation,
    useCaptureHotelPaypalOrderAndSaveHotelBookingMutation,
    useCreateHotelPaypalOrderMutation,
    useCreateHotelCheckoutSessionMutation,
    useUpdateHotelBookingStatusMutation,
    useGetHotelBookingsQuery,
    useCreateHotelPayOSLinkMutation,
    useSaveHotelBookingMutation,
} = hotelBookingApiSlice;
