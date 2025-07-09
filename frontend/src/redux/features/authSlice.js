import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: localStorage.getItem("userInfo")
        ? JSON.parse(localStorage.getItem("userInfo"))
        : null,
    onlineUsers: [],
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload;
            localStorage.setItem("userInfo", JSON.stringify(action.payload));

            // const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days
            // localStorage.setItem("expirationTime", expirationTime);
        },
        logout: (state) => {
            state.user = null;
            state.token = ""
            localStorage.clear();
        },
        setOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
    },
});

export const { setCredentials, logout, setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;