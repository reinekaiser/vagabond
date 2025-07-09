import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const baseQuery = fetchBaseQuery({ 
    baseUrl: BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState, endpoint, body }) => {
        headers.set('Accept', 'application/json');
        
        // Don't set Content-Type for FormData, let browser set it with boundary
        if (body instanceof FormData) {
            // Remove Content-Type to let browser set it with proper boundary
            headers.delete('Content-Type');
            console.log('FormData detected, Content-Type header removed');
        }
        
        return headers;
    }
});

export const apiSlice = createApi({
    baseQuery,
    tagTypes: ["Tour", "Hotel", "AdminProfile", "UserToChat"],
    endpoints: () => ({}),
});
