import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAllUsers, getUserToChat, sendMessage, getMessages, markMessagesAsRead} from "../controllers/messageController.js"

const router = express.Router();

router.get("/", protect, getAllUsers);
router.get("/users_to_chat", protect, getUserToChat);
router.get("/:id", protect, getMessages);
router.post("/send/:id", protect, sendMessage);
router.put('/mark-as-read/:id', protect, markMessagesAsRead);



export default router;