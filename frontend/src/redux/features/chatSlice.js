import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    users: [],
    messages: [],
    selectedUser: null,
    unreadCount: {},
};


const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setSelectedUser: (state, action) => {
            const user = action.payload;
            state.selectedUser = user;
            if (user && state.unreadCount[user._id]) {
                state.unreadCount[user._id] = 0;
            }
        },
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        addMessage: (state, action) => {
            const message = action.payload;
            const { sender, newMessage, currentUserId } = message;
            state.messages.push(newMessage);

            if (!state.unreadCount[sender._id]) {
                state.unreadCount[sender._id] = 1;
            } else {
                state.unreadCount[sender._id]++;
            }
        },
        setUsers: (state, action) => {
            state.users = action.payload
            state.unreadCount = {};
            action.payload.forEach(user => {
                state.unreadCount[user._id] = user.unreadCount || 0;
            });
        },
        addUser: (state, action) => {
            const { sender, currentUserId } = action.payload;
            const exists = state.users.find(user => user._id === sender._id);
            if (!exists) {
                state.users.push(sender);
            }
            if (sender._id !== currentUserId) {
                if (!state.unreadCount[sender._id]) {
                    state.unreadCount[sender._id] = 1;
                } else {
                    state.unreadCount[sender._id]++;
                }
            }
        },
    },
});

export const { setSelectedUser, setMessages, addMessage, setUsers, addUser } = chatSlice.actions;
export default chatSlice.reducer;