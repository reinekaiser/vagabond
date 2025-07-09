import { apiSlice } from "./apiSlice";

export const chatbotApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        sendQuery: builder.mutation({
            query: ({ input }) => {
                const token = localStorage.getItem("token");
                return {
                    url: `/api/chatbot`,
                    method: "POST",
                    body: { input },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
            },
        }),
    }),
});

export const { useSendQueryMutation } = chatbotApiSlice;
