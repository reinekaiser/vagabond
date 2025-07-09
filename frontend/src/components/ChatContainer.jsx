import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetMessagesQuery, useSendMessageMutation } from '../redux/api/messageApiSlice'
import { setMessages, addMessage } from '../redux/features/chatSlice'
import { RiSendPlaneFill } from "react-icons/ri";
import { connectSocket } from '../Utils/socket'

const ChatContainer = ({ onClick }) => {
    const dispatch = useDispatch();
    const messageEndRef = useRef(null);
    const { selectedUser, messages: msg } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);
    const { data: messages, isLoading: isLoadingMsg } = useGetMessagesQuery(selectedUser._id, {
        skip: !selectedUser?._id,
        refetchOnMountOrArgChange: true,
    })
    useEffect(() => {
        if (selectedUser?._id && messages) {
            dispatch(setMessages(messages));
        }
    }, [messages, selectedUser?._id]);
    useEffect(() => {
        if (selectedUser?._id) {
            const socket = connectSocket(user._id, user.role);
            socket.on("newMessage", (newMessage) => {
                const message = {
                    ...newMessage,
                    currentUserId: user._id,
                };
                console.log(">", message)
                const isMessageSentFromSelectedUser = String(message.sender._id) === String(selectedUser._id);
                console.log(isMessageSentFromSelectedUser)
                if (!isMessageSentFromSelectedUser) return;
                dispatch(addMessage(message));
            });

            return () => {
                socket.off("newMessage");
            };
        }
    }, [selectedUser._id]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [msg]);

    return (
        <div className="flex flex-col h-full max-h-screen">
            {isLoadingMsg && msg ? (
                <div className="flex justify-center items-center h-full">
                    <span className="text-gray-500 text-sm">Đang tải tin nhắn...</span>
                </div>
            ) : (
                <div
                    className="flex flex-col flex-1 overflow-hidden"
                    onClick={onClick}
                >
                    <ChatHeader />

                    <div
                        className="flex-1 overflow-y-auto p-4 space-y-4"
                        onClick={onClick}
                    >
                        {msg?.map((message) => {
                            const isMine = message.senderId === user._id;
                            const time = new Date(message.createdAt).toLocaleString([], {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                            });

                            return (
                                <div
                                    key={message._id}
                                    className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                                    ref={messageEndRef}
                                >
                                    <div className={`flex items-end ${isMine ? "justify-end" : "justify-start"}`}>
                                        {!isMine && (
                                            <img
                                                src={selectedUser.profilePic || "/ava.jpg"}
                                                alt="avatar"
                                                className="w-8 h-8 rounded-full mr-2"
                                            />
                                        )}

                                        <div
                                            className={`px-4 py-2 rounded-lg max-w-xs ${isMine
                                                ? "bg-blue-500 text-white rounded-br-none"
                                                : "bg-gray-200 text-black rounded-bl-none"
                                                }`}
                                        >
                                            {message.text}
                                        </div>
                                    </div>


                                    <div className="">
                                        {isMine ? (
                                            <span className="text-xs text-zinc-400 mt-1">
                                                {time}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-zinc-400 mt-1 ml-10">
                                                {time}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>


                    <MessageInput dispatch={dispatch} />
                </div>
            )}
        </div>
    )
}

const ChatHeader = () => {
    const { selectedUser } = useSelector((state) => state.chat);
    const { onlineUsers } = useSelector((state) => state.auth);
    const isOnline = onlineUsers.includes(selectedUser?._id);

    return (
        <div className="flex items-center gap-4 px-5 py-[18px] border-b border-base-300 bg-base-100">
            <div className="relative">
                <img
                    src={selectedUser?.profilePicture || "/ava.jpg"}
                    alt={selectedUser?.firstName}
                    className="w-10 h-10 rounded-full object-cover"
                />
                {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
            </div>
            <div>
                <div className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</div>
                <div className="text-sm text-zinc-400">
                    {isOnline ? "Online" : "Offline"}
                </div>
            </div>
        </div>
    );
};

const MessageInput = ({ dispatch }) => {
    const [text, setText] = useState("");
    const { selectedUser } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);
    const [sendMsg] = useSendMessageMutation();

    const handleChange = (e) => {
        setText(e.target.value);
    };
    const handleSend = async () => {
        if (!text.trim()) return;
        try {
            const res = await sendMsg({ id: selectedUser._id, text }).unwrap();
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
        <div className="p-4 border-t border-base-300 bg-base-100 flex items-center gap-3">
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
                className="w-full px-4 py-2 rounded-lg border border-base-300 bg-base-200 outline-none"
            />
            <button
                className="btn btn-sm btn-circle "
                disabled={!text.trim()}
                onClick={() => {
                    handleSend();
                }}
            >
                <RiSendPlaneFill size={25} className="text-blue-600 hover:text-blue-800 duration-200 cursor-pointer" />
            </button>
        </div>
    );
};

export default ChatContainer