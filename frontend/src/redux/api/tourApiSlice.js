import { apiSlice } from "./apiSlice";
import { TOUR_URL } from "../constants";

export const tourApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createTour: builder.mutation({
            query: (tour) => ({
                url: `${TOUR_URL}`,
                method: "POST",
                body: tour,
            }),
            invalidatesTags: ["Tour"],
        }),
        getTours: builder.query({
            query: (params = {}) => ({
                url: `${TOUR_URL}`,
                params,
            }),
            providesTags: ["Tour"],
        }),
        deleteTour: builder.mutation({
            query: (tourId) => ({
                url: `${TOUR_URL}/${tourId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Tour"],
        }),
        updateTour: builder.mutation({
            query: ({ tourId, data }) => ({
                url: `${TOUR_URL}/${tourId}`,
                method: "PUT",
                body: data,
            }),
        }),
        getTourDetails: builder.query({
            query: (tourId) => ({
                url: `${TOUR_URL}/${tourId}`,
            }),
            providesTags: (result, error, tourId) => [
                { type: "Tour", id: tourId },
            ],
        }),
        addTicketToTour: builder.mutation({
            query: ({ tourId, ticketData }) => ({
                url: `${TOUR_URL}/${tourId}/ticket`,
                method: "POST",
                body: ticketData,
            }),
        }),
        deleteTicketFromTour: builder.mutation({
            query: ({ tourId, ticketId }) => ({
                url: `${TOUR_URL}/${tourId}/ticket/${ticketId}`,
                method: "DELETE",
            }),
        }),
        updateTicketInTour: builder.mutation({
            query: ({ tourId, ticketId, ticketData }) => ({
                url: `${TOUR_URL}/${tourId}/ticket/${ticketId}`,
                method: "PUT",
                body: ticketData,
            }),
            invalidatesTags: (result, error, { tourId }) => [
                { type: "Tour", id: tourId },
            ],
        }),
        getSearchSuggestions: builder.query({
            query: (keyword) => ({
                url: `${TOUR_URL}/suggestion?q=${encodeURIComponent(keyword)}`
            })
        }),
        getSearchResults: builder.query({
            query: (params) => {
                const queryString = new URLSearchParams(params).toString()
                return `${TOUR_URL}/search?${queryString}`
            }
        }),
        getTourStats: builder.query({
            query: () => ({
                url: `${TOUR_URL}/stats`
            })
        })
    }),
});

export const {
    useCreateTourMutation,
    useGetToursQuery,
    useDeleteTourMutation,
    useUpdateTourMutation,
    useGetTourDetailsQuery,
    useAddTicketToTourMutation,
    useDeleteTicketFromTourMutation,
    useUpdateTicketInTourMutation,
    useGetSearchSuggestionsQuery,
    useGetSearchResultsQuery,
    useGetTourStatsQuery,
    useLazyGetTourDetailsQuery
} = tourApiSlice;
