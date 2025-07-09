import { MESSAGE_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const messageApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: () => {
                const token = localStorage.getItem('token');
                return {
                    url: `${MESSAGE_URL}/`,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            },
            providesTags: ['UserToChat']
        }),
        getUserToChat: builder.query({
            query: () => {
                const token = localStorage.getItem('token');
                return {
                    url: `${MESSAGE_URL}/users_to_chat`,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            }
        }),
        getMessages: builder.query({
            query: (id) => {
                const token = localStorage.getItem('token');
                return {
                    url: `${MESSAGE_URL}/${id}`,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            },
        }),
        sendMessage: builder.mutation({
            query: ({ id, text }) => {
                const token = localStorage.getItem('token');
                return {
                    url: `${MESSAGE_URL}/send/${id}`,
                    method: "POST",
                    body: { text },
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            },
            invalidatesTags: ['UserToChat']
        }),
        markMessagesAsRead: builder.mutation({
            query: (id) => {
                const token = localStorage.getItem('token');
                return {
                    url: `${MESSAGE_URL}/mark-as-read/${id}`,
                    method: "PUT",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
            }
        })
    }),
});

export const {
    useGetUsersQuery,
    useGetMessagesQuery,
    useGetUserToChatQuery,
    useSendMessageMutation,
    useMarkMessagesAsReadMutation
} = messageApiSlice