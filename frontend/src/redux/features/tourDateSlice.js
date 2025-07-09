import { createSlice } from "@reduxjs/toolkit";

const tourDateSlice = createSlice({
    name: "tourDate",
    initialState: {
        selectedDate: null,
    },
    reducers: {
        setSelectedDate: (state, action) => {
            state.selectedDate = action.payload;
        },
        clearSelectedDate: (state) => {
            state.selectedDate = null;
        },
    },
});

export const { setSelectedDate, clearSelectedDate } = tourDateSlice.actions;
export default tourDateSlice.reducer;
