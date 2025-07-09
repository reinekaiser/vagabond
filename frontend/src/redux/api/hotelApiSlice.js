import { FACILITY_URL, HOTEL_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const hotelApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFacilities: builder.query({
            query: () => `${FACILITY_URL}`
        }),
        getFacilitiesByCategory: builder.query({
            query: () => `${FACILITY_URL}/groupByCategory`
        }),
        getFacilitiesFromIds: builder.query({
            query: (serviceFacilityIds) => ({
                url: `${FACILITY_URL}/listFacilitieIds`,
                method: 'POST',
                body: serviceFacilityIds,
            }),
        }),
        getSearchHotelSuggestion: builder.query({
            query: (params) => ({
                url: `${HOTEL_URL}/search`,
                params
            })
        }),
        getHotelById: builder.query({
            query: (hotelId) => `${HOTEL_URL}/${hotelId}`,
            providesTags: ["Hotel"],
        }),
        getHotels: builder.query({
            query: (params = {}) => ({
                url: `${HOTEL_URL}`,
                params,
            }),
            providesTags: ["Hotel"],
        }),
        getRoomTypes: builder.query({
            query: (hotelId) => `${HOTEL_URL}/${hotelId}/room-types`
        }),
        createHotel: builder.mutation({
            query: (hotel) => ({
                url: `${HOTEL_URL}`,
                method: "POST",
                body: hotel,
            }),
            invalidatesTags: ["Hotel"],
        }),
        updateHotel: builder.mutation({
            query: ({ hotelId, hotel }) => ({
                url: `${HOTEL_URL}/update/${hotelId}`,
                method: "PUT",
                body: hotel,
            }),
            invalidatesTags: ["Hotel"],
        }),
        deleteHotel: builder.mutation({
            query: (hotelId) => ({
                url: `${HOTEL_URL}/delete/${hotelId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Hotel"],
        }),
        createRoomType: builder.mutation({
            query: ({ hotelId, roomType }) => ({
                url: `${HOTEL_URL}/${hotelId}/room-types`,
                method: "POST",
                body: roomType,
            }),
            invalidatesTags: ["Hotel"],
        }),
        deleteRoomType: builder.mutation({
            query: ({ hotelId, roomTypeId }) => ({
                url: `${HOTEL_URL}/${hotelId}/room-types/delete/${roomTypeId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Hotel"],
        }),
        updateRoomType: builder.mutation({
            query: ({ hotelId, roomTypeId, roomType }) => ({
                url: `${HOTEL_URL}/${hotelId}/room-types/update/${roomTypeId}`,
                method: "PUT",
                body: roomType,
            }),
            invalidatesTags: ["Hotel"],
        }),
        createRoom: builder.mutation({
            query: ({ hotelId, roomTypeId, room }) => ({
                url: `${HOTEL_URL}/${hotelId}/room-types/${roomTypeId}/rooms`,
                method: "POST",
                body: room,
            }),
            invalidatesTags: ["Hotel"],
        }),
        updateRoom: builder.mutation({
            query: ({ hotelId, roomTypeId, roomId, room }) => ({
                url: `${HOTEL_URL}/${hotelId}/room-types/${roomTypeId}/rooms/update/${roomId}`,
                method: "PUT",
                body: room,
            }),
            invalidatesTags: ["Hotel"],
        }),
        deleteRoom: builder.mutation({
            query: ({ hotelId, roomTypeId, roomId }) => ({
                url: `${HOTEL_URL}/${hotelId}/room-types/${roomTypeId}/rooms/delete/${roomId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Hotel"],
        }),
        getAvailableRooms: builder.query({
            query: ({ id, checkInDate, checkOutDate, numRooms, numAdults }) => ({
                url: `${HOTEL_URL}/${id}/available-rooms`,
                params: {
                    checkInDate,
                    checkOutDate,
                    numRooms,
                    numAdults
                }
            }),
        }),
        
    }),
});

export const {
    useGetFacilitiesQuery,
    useGetFacilitiesByCategoryQuery,
    useGetSearchHotelSuggestionQuery,
    useGetHotelsQuery,
    useLazyGetHotelsQuery,
    useGetHotelByIdQuery,
    useGetRoomTypesQuery,
    useGetFacilitiesFromIdsQuery,
    useCreateHotelMutation,
    useUpdateHotelMutation,
    useDeleteHotelMutation,
    useCreateRoomTypeMutation,
    useDeleteRoomTypeMutation,
    useUpdateRoomTypeMutation,
    useCreateRoomMutation,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
    useGetAvailableRoomsQuery,
} = hotelApiSlice;