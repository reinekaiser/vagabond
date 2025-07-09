import { useState, useEffect } from "react";
import NoChatSelected from '../../components/NoChatSelected';
import ChatContainer from '../../components/ChatContainer';
import { useDispatch, useSelector } from "react-redux";
import { setUsers, setSelectedUser } from '../../redux/features/chatSlice';
import { useGetUserToChatQuery, useMarkMessagesAsReadMutation } from '../../redux/api/messageApiSlice';
import { RiUserAddFill } from "react-icons/ri";
import { connectSocket } from '../../Utils/socket'
import { addUser } from '../../redux/features/chatSlice'

const AdminChat = () => {
    const dispatch = useDispatch();
    const { user: userInfo } = useSelector((state) => state.auth);
    const { selectedUser } = useSelector((state) => state.chat);
    const { data: user, isLoading: isLoadingUser, refetch } = useGetUserToChatQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    useEffect(() => {
        if (user) {
            dispatch(setUsers(user));
        }
    }, [user]);

    useEffect(() => {
        const socket = connectSocket(userInfo._id, userInfo.role);
        console.log(socket)
        socket.on("newMessage", (newMessage) => {
            const message = {
                ...newMessage,
                currentUserId: userInfo._id,
            };
            dispatch(addUser(message))
        });

        return () => {
            socket.off("newMessage");
        };
    }, [selectedUser])

    const [markSent] = useMarkMessagesAsReadMutation();
    const handleMarkMessagesAsRead = async () => {
        if (selectedUser) {
            try {
                dispatch(setSelectedUser(selectedUser));
                console.log("handleMarkMessagesAsRead")
                const res = await markSent(selectedUser._id);
                console.log(res);
            } catch (error) {
                console.error("Error marking messages as read from ChatContainer:", error);
            }
        }
    };

    return (
        <div>
            <div className='bg-softBlue min-h-screen p-4 md:p-8'>
                <p className='flex-1 font-semibold text-[20px] md:text-[24px]'>Tin nhắn</p>
                <div className="h-screen bg-base-200">
                    <div className="flex items-center justify-center pt-10 px-4">
                        <div className="bg-white rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-12rem)] shadow-sm">
                            <div className="flex h-full rounded-lg overflow-hidden">
                                <div>
                                    {isLoadingUser ? (
                                        <div className="w-72 p-5 animate-pulse space-y-4 border-r border-base-300">
                                            {[...Array(4)].map((_, idx) => (
                                                <div key={idx} className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <ChatSideBar />
                                    )}
                                </div>
                                <div className="flex-1">
                                    {!selectedUser ? <NoChatSelected /> : <ChatContainer onClick={handleMarkMessagesAsRead} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ChatSideBar = () => {
    const dispatch = useDispatch();
    const { users, selectedUser, unreadCount } = useSelector((state) => state.chat);
    const { onlineUsers, user } = useSelector((state) => state.auth);
    const [markSent] = useMarkMessagesAsReadMutation()

    const handleSelectUser = async (user) => {
        dispatch(setSelectedUser(user));
        try {
            const res = await markSent(user._id);
            console.log(res);
        } catch (error) {
            console.log(error);
        }
    };

    // console.log("admin - ", unreadCount)

    return (
        <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
            <div className="border-b border-base-300 w-full p-4 flex items-center gap-4">
                <div className="relative w-12 h-12">
                    <img
                        src={user.profilePicture || "/ava.jpg"}
                        alt={user.firstName}
                        className="w-full h-full object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                </div>

                <div
                    className="text-[24px] text-gray-700 ml-auto rounded-xl p-2 cursor-pointer hover:bg-slate-100 duration-300"
                    onClick={() => dispatch(setSelectedUser(null))}
                >
                    <RiUserAddFill />
                </div>
            </div>

            <div className="overflow-y-auto w-full">
                {users.map((user) => (
                    <button
                        key={user._id}
                        onClick={() => handleSelectUser(user)}
                        className={`w-full px-5 py-3 flex items-center gap-3 hover:bg-base-300 transition-colors 
                            ${selectedUser?._id === user._id ? "bg-slate-200" : ""}`}
                    >
                        <div className="relative mx-auto lg:mx-0">
                            <img
                                src={user.profilePicture || "/ava.jpg"}
                                alt={user.firstName}
                                className="size-12 object-cover rounded-full"
                            />
                            {onlineUsers.includes(user._id) && (
                                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full" />
                            )}
                        </div>

                        <div className="hidden lg:block text-left min-w-0 w-full">
                            {unreadCount[user._id] > 0 ? (
                                <div className="font-semibold truncate">
                                    {user.firstName} {user.lastName}
                                    <div className="text-sm text-zinc-400 relative">
                                        Tin nhắn mới
                                        <span className="absolute bottom-4 right-0 size-3 bg-sky-500 rounded-full" />
                                    </div>
                                </div>
                            ) : (
                                <div className="font-medium truncate">
                                    {user.firstName} {user.lastName}
                                    <div className="text-sm text-zinc-400">
                                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                                    </div>
                                </div>

                            )}

                        </div>
                    </button>
                ))}
            </div>
        </aside>
    );
};

export default AdminChat