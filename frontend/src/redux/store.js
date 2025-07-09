import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { apiSlice } from "./api/apiSlice";
import recentSearchReducer from './features/recentSearchSlice';
import authReducer from "./features/authSlice"
import chatReducer from "./features/chatSlice"
import tourDateReducer from "./features/tourDateSlice"
export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        recentSearch: recentSearchReducer,
        auth: authReducer,
        chat: chatReducer,
        tourDate: tourDateReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true
});
