import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL, "http://localhost:5173"],
        credentials: true,
    },
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

//store online users { userId: socketId }
const userSocketMap = {}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    const role = socket.handshake.query.role;
    console.log("A user connected at ", socket.id, ":", userId, "with role:", role);

    if (userId) {
        userSocketMap[userId] = socket.id;
        if (role === "admin") {
            socket.join("adminRoom");
        }
    }
    io.to("adminRoom").emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        if (userId) {
            delete userSocketMap[userId];
        }
        io.to("adminRoom").emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { io, app, server };