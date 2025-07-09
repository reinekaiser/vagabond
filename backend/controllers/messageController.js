import User from "../models/user.js";
import Message from "../models/message.js";
import { getReceiverSocketId, io } from "../config/socket.js";
import mongoose from 'mongoose';

export const getAllUsers = async (req, res) => {
    try {
        const currentUser = req.user;
        if (!currentUser) {
            return res.status(403).send('Something went wrong...');
        }
        const query = { _id: { $ne: currentUser._id } };
        if (currentUser.role === 'user') {
            query.role = 'admin';
        } else if (currentUser.role === 'admin') {
            query.role = 'user';
        }
        const users = await User.find(query).select("-password");
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getUserToChat = async (req, res) => {
    try {
        const currentUser = req.user;

        if (!currentUser) {
            return res.status(403).send('Something went wrong...');
        }

        const query = { _id: { $ne: currentUser._id } };
        if (currentUser.role === 'user') {
            query.role = 'admin';
        }

        const users = await User.find(query).select("-password");

        const usersWithMessages = [];

        for (const user of users) {
            const latestMessage = await Message.findOne({
                $or: [
                    { senderId: currentUser._id, receiverId: user._id },
                    { senderId: user._id, receiverId: currentUser._id },
                ]
            })
                .sort({ createdAt: -1 })
                .limit(1);

            const unreadCount = await Message.countDocuments({
                senderId: user._id,
                receiverId: currentUser._id,
                isRead: false,
            });

            if (currentUser.role === 'user' || latestMessage) {
                usersWithMessages.push({
                    ...user.toObject(),
                    latestMessageTime: latestMessage ? latestMessage.createdAt : null,
                    unreadCount: unreadCount
                });
            }
        }

        usersWithMessages.sort((a, b) => {
            if (a.unreadCount && !b.unreadCount) return -1;
            if (!a.unreadCount && b.unreadCount) return 1;
            return new Date(b.latestMessageTime) - new Date(a.latestMessageTime);
        });

        return res.status(200).json(usersWithMessages);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const markMessagesAsRead = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const userId = req.params.id;
        const sender = await User.findById(userId);
        if (!sender) {
            return res.status(404).json({ message: 'Logged-in user not found' });
        }
        const receiver = await User.findById(currentUserId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver user not found' });
        }

        await Message.updateMany(
            {
                senderId: sender._id,
                receiverId: receiver._id,
                isRead: false
            },
            { $set: { isRead: true } }
        );

        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "Message text cannot be empty." });
        }
        const sender = await User.findById(senderId);
        if (!sender) {
            return res.status(404).json({ message: 'Logged-in user not found' });
        }
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver user not found' });
        }

        const newMessage = new Message({
            senderId: sender._id,
            receiverId: receiver._id,
            text,
            isRead: false
        });
        await newMessage.save();

        const unreadCount = await Message.countDocuments({
            senderId: sender._id,
            receiverId: receiver._id,
            isRead: false,
        });

        //real-time
        const receiverSocketId = getReceiverSocketId(receiver._id);
        console.log("rc - ", receiverSocketId)
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", {
                newMessage,
                sender: sender,
            });
        }

        res.status(201).json({
            newMessage,
            sender: sender,
        });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}