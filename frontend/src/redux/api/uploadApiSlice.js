import { UPLOAD_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const uploadApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        uploadImages: builder.mutation({
            query: (data) => ({
                url: `${UPLOAD_URL}/update`,
                method: "POST",
                body: data,
            })
        }),
        deleteImage: builder.mutation({
            query: (public_id) => ({
                url: `${UPLOAD_URL}/delete/${public_id}`,
                method: "DELETE",
            }),
        })
    }),
});

export const { useUploadImagesMutation, useDeleteImageMutation } = uploadApiSlice;