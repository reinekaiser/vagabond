import { BiSupport } from "react-icons/bi";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    useGetMessagesQuery,
    useSendMessageMutation,
    useGetUserToChatQuery,
    useMarkMessagesAsReadMutation,
} from "../../redux/api/messageApiSlice";
import { RiSendPlaneFill } from "react-icons/ri";
import { Box, CircularProgress } from "@mui/material";
import { useSendQueryMutation } from "../../redux/api/chatbotApiSlice";
import { useGetTourDetailsQuery, useLazyGetTourDetailsQuery } from "../../redux/api/tourApiSlice";
import { CLOUDINARY_BASE_URL } from "../../constants/hotel";
import { Link } from "react-router";
import TourCard from "../../components/TourCard";
const ChatBot = () => {
    const [messages, setMessages] = useState([]);
    const messageEndRef = useRef(null);

    const [sendQuery, isLoading] = useSendQueryMutation();
    const [getTourDetails] = useLazyGetTourDetailsQuery();

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (messageEndRef.current) {
                messageEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 0);

        return () => clearTimeout(timeout);
    }, [messages]);

    //✅ Tin nhắn giới thiệu khi mở trang lần đầu
    useEffect(() => {
        setMessages([
            {
                role: "bot",
                content:
                    "Xin chào! Tôi là trợ lý du lịch ảo. Bạn muốn tìm tour ở đâu, vào thời gian nào?",
            },
        ]);
    }, []);


    const [input, setInput] = useState("");
    const [waitingForBot, setWaitingForBot] = useState(false);

    const sendMessage = async () => {
        const extractTourIdAndClean = (text) => {
            const match = text.match(/tourId:\s*([a-f0-9]{24})/i);
            const tourId = match ? match[1] : null;
            // Loại bỏ toàn bộ dòng chứa tourId
            const cleanedContent = text
                .replace(/\n?\*{0,2}tourId:\s*[a-f0-9]{24}\*{0,2}/i, "")
                .trim();
            return { tourId, cleanedContent };
        };

        if (!input.trim()) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setWaitingForBot(true);
        try {
            const res = await sendQuery({ input }).unwrap();

            const { tourId, cleanedContent } = extractTourIdAndClean(res?.response);

            console.log(tourId);
            const botMessage = { role: "bot", content: cleanedContent };

            setMessages((prev) => [...prev, botMessage]);

            if (tourId) {
                const { data: tourRes } = await getTourDetails(tourId);
                console.log(tourRes?.tour);
                setMessages((prev) => [...prev, { role: "tour", content: tourRes?.tour }]);
            }
        } catch (err) {
            console.log(err);
            setMessages((prev) => [...prev, { role: "bot", content: "Đã xảy ra lỗi." }]);
        } finally {
            setWaitingForBot(false);
        }
    };

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
                    <p className="text-[18px] font-semibold">Chat với Vagabond bot</p>
                </div>

                <div className="bg-slate-100 flex-1 overflow-y-auto p-4">
                    {messages?.length > 0 ? (
                        messages.map((message, index) => {
                            const time = new Date().toLocaleTimeString([], {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            });

                            if (message.role === "tour") {
                                const tour = message.content;

                                return (
                                    <div key={index} className="flex flex-col w-[300px] items-start">
                                        <TourCard tour={tour} key={index}></TourCard>
                                    </div>
                                );
                            }

                            const isMine = message.role === "user";

                            return (
                                <div
                                    key={index}
                                    className={`flex flex-col ${
                                        isMine ? "items-end" : "items-start"
                                    }`}
                                >
                                    <div
                                        className={`px-3 py-2 rounded-lg max-w-[70%] ${
                                            isMine
                                                ? "bg-blue-500 text-white rounded-br-none"
                                                : "bg-gray-200 text-black rounded-bl-none"
                                        }`}
                                    >
                                        {message.content}
                                    </div>
                                    <span className="text-[12px] text-zinc-400 mt-1">{time}</span>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-400 mt-5">Nhắn với admin</div>
                    )}
                    {waitingForBot && isLoading && (
                        <div className="text-center bot text-gray-500 italic">
                            Vui lòng chờ trong giây lát
                        </div>
                    )}
                    <div ref={messageEndRef}></div>
                </div>

                <div className="mt-2 mx-4">
                    <div className="flex items-center justify-center gap-2 pt-1">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 outline-none"
                        />
                        <button
                            type="button"
                            className="p-2 rounded-full hover:bg-blue-100"
                            disabled={!input.trim()}
                            onClick={sendMessage}
                        >
                            <RiSendPlaneFill
                                size={22}
                                className="text-blue-600 hover:text-blue-800"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBot;
