import { BiSupport } from "react-icons/bi";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetMessagesQuery, useSendMessageMutation, useGetUserToChatQuery, useMarkMessagesAsReadMutation } from '../../redux/api/messageApiSlice';
import { RiSendPlaneFill } from "react-icons/ri";
import { setMessages, addMessage, setUsers, setSelectedUser } from '../../redux/features/chatSlice'
import { connectSocket } from '../../Utils/socket'
import { Box, CircularProgress } from '@mui/material';

const Chat = () => {
    const dispatch = useDispatch();
    const [adminId, setAdminId] = useState();
    const { messages: msg, unreadCount } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);
    const { data: messages, isLoading: isLoadingMsg } = useGetMessagesQuery(adminId, {
        skip: !adminId,
        refetchOnMountOrArgChange: true,
    })
    const { data: admin, isLoading: isLoadingAdmin } = useGetUserToChatQuery();
    const messageEndRef = useRef(null);
    const [markSent] = useMarkMessagesAsReadMutation();

    useEffect(() => {
        const initializeChat = async () => {
            if (admin && admin.length > 0) {
                setAdminId(admin[0]._id);
                dispatch(setSelectedUser(admin[0]));
                try {
                    console.log("MarkMessagesAsRead")
                    const res = await markSent(admin[0]._id);
                    console.log(res)
                } catch (error) {
                    console.error("Error marking messages as read:", error);
                }
            }
        };
        initializeChat();
    }, [admin]);
    useEffect(() => {
        if (adminId && messages) {
            dispatch(setMessages(messages));
        }
    }, [messages, dispatch]);
    useEffect(() => {
        if (adminId) {
            const socket = connectSocket(user._id, user.role);
            socket.on("newMessage", (newMessage) => {
                const message = {
                    ...newMessage,
                    currentUserId: user._id,
                };
                console.log("<", message)
                const isMessageSentFromAdmin = String(message.sender._id) === String(adminId);
                console.log(isMessageSentFromAdmin)
                if (!isMessageSentFromAdmin) return;
                dispatch(addMessage(message));
            });
            return () => {
                socket.off("newMessage");
            };
        }
    }, [adminId])

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (messageEndRef.current) {
                messageEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 0);

        return () => clearTimeout(timeout);
    }, [msg]);

    if (isLoadingMsg || isLoadingAdmin) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    
    return (
        <div className="relative h-screen overflow-hidden">
            <img
                src="/images/login/background.png"
                alt="Background"
                className="w-full h-full object-cover"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg py-3 shadow-md w-full max-w-3xl h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
                <div className="flex items-center gap-3 mb-4 px-4">
                    <div className="p-2 rounded-full bg-blue-500 text-white">
                        <BiSupport size={18} />
                    </div>
                    <p className="text-[18px] font-semibold">Hỗ trợ khách hàng</p>
                </div>

                <div className="bg-slate-100 flex-1 overflow-y-auto p-4">
                    {msg?.length > 0 ? (
                        msg.map((message) => {
                            const isMine = message.senderId === user?._id;
                            const time = new Date(message.createdAt).toLocaleTimeString([], {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            });

                            return (
                                <div
                                    key={message._id}
                                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`px-3 py-2 rounded-lg max-w-[70%] ${isMine
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-gray-200 text-black rounded-bl-none'
                                            }`}
                                    >
                                        {message.text}
                                    </div>
                                    <span className="text-[12px] text-zinc-400 mt-1">{time}</span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-400 mt-5">Nhắn với admin</div>
                    )}
                    <div ref={messageEndRef}></div>
                </div>

                <div className="mt-2 mx-4">
                    <MessageInput dispatch={dispatch} />
                </div>
            </div>
        </div>
    )
}

const MessageInput = ({ dispatch }) => {
    const [text, setText] = useState("");
    const { user } = useSelector((state) => state.auth);
    const { selectedUser } = useSelector((state) => state.chat);
    const adminId = selectedUser?._id;
    const [sendMsg] = useSendMessageMutation();

    const handleChange = (e) => setText(e.target.value);
    const handleSend = async () => {
        if (!text.trim() || !adminId) return;
        try {
            const res = await sendMsg({ id: adminId, text }).unwrap();
            const message = {
                ...res,
                currentUserId: user._id,
            };
            dispatch(addMessage(message));
            setText("");
        } catch (error) {
            console.error("Send message failed:", error);
        }
    };

    return (
        <div className="flex items-center justify-center gap-2 pt-1">
            <input
                type="text"
                placeholder="Type your message..."
                value={text}
                onChange={handleChange}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 outline-none"
            />
            <button
                type="button"
                className="p-2 rounded-full hover:bg-blue-100"
                disabled={!text.trim()}
                onClick={handleSend}
            >
                <RiSendPlaneFill size={22} className="text-blue-600 hover:text-blue-800" />
            </button>
        </div>
    );
};

export default Chat