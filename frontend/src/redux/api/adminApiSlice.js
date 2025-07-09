import { apiSlice } from './apiSlice';
import { ADMIN_URL } from '../constants';

export const adminApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAdminProfile: builder.query({
            query: () => {
                const token = localStorage.getItem('token');
                return {
                    url: `${ADMIN_URL}/profile`,
                    method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                    }
                };
                },
            transformResponse: (response) => response.data,
            providesTags: ['AdminProfile']
        }),

        updateAdminProfile: builder.mutation({
            query: (formData) => {
                const token = localStorage.getItem('token');
                return {
                url: `${ADMIN_URL}/profile`,
                method: 'PUT',
                body: formData,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
            },
            invalidatesTags: ['AdminProfile']
        }),

        updateAdminAvatar: builder.mutation({
            query: (formData) => {
                const token = localStorage.getItem('token');
                return {
                url: `${ADMIN_URL}/profile/avatar`,
                method: 'POST',
                body: formData,
                formData: true,
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
            },
            invalidatesTags: ['AdminProfile'],
            transformResponse: (response) => {
                console.log('Avatar update response:', response);
                return response;
            }
        }),

        updateAdminPassword: builder.mutation({
            query: (passwordData) => {
                const token = localStorage.getItem('token');
                return {
                url: `${ADMIN_URL}/change-password`,
                method: 'POST',
                body: passwordData,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
            },
            onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
                console.log('Password change request started with:', { ...arg, password: '[hidden]' });
                try {
                    const result = await queryFulfilled;
                    console.log('Password change response:', result);
                } catch (error) {
                    console.error('Password change error:', error);
                }
            }
        })
    })
});

export const {
    useGetAdminProfileQuery,
    useUpdateAdminProfileMutation,
    useUpdateAdminAvatarMutation,
    useUpdateAdminPasswordMutation
} = adminApiSlice;