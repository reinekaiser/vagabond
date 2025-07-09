import { createSlice } from "@reduxjs/toolkit";

const loadFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem("recentSearches")) || [];
    } catch {
        return [];
    }
};

const saveToStorage = (list) => {
    localStorage.setItem("recentSearches", JSON.stringify(list));
};

const recentSearchSlice = createSlice({
    name: "recentSearch",
    initialState: loadFromStorage(),
    reducers: {
        addSearch(state, action) {
            const item = action.payload;
            const updated = [item, ...state.filter((i) => i !== item)].slice(
                0,
                5
            );
            saveToStorage(updated);
            return updated;
        },
        removeSearch(state, action) {
            const updated = state.filter((i) => i !== action.payload);
            saveToStorage(updated);
            return updated;
        },
        clearSearches() {
            saveToStorage([]);
            return [];
        },
    },
});

export const { addSearch, removeSearch, clearSearches } =
    recentSearchSlice.actions;
export default recentSearchSlice.reducer;
