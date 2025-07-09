import { io } from "socket.io-client";

let socket;

export const connectSocket = (userId, role) => {
    if (socket) return socket;
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    socket = io(BASE_URL, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        query: { userId, role },
        withCredentials: true
    });
    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};