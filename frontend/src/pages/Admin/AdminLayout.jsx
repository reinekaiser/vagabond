import { Outlet } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaMoneyBillWave, FaHotel, FaUmbrellaBeach, FaUser, FaCity } from "react-icons/fa";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { TbDeviceAnalytics } from "react-icons/tb";
import { BiSolidMessageDetail } from "react-icons/bi";

import { useGetUserToChatQuery } from "../../redux/api/messageApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket } from "../../Utils/socket";
import { addUser } from "../../redux/features/chatSlice";
const AdminLayout = () => {
    const dispatch = useDispatch();
    const { selectedUser, unreadCount } = useSelector((state) => state.chat);
    const { user: userInfo } = useSelector((state) => state.auth);
    const { data: users } = useGetUserToChatQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });
    // const hasUnreadMessages =
    //     Object.entries(unreadCount).some(
    //         ([userId, count]) => userId !== userInfo._id && count > 0
    //     ) ||
    //     (users && users.some((user) => user._id !== userInfo._id && user.unreadCount > 0));
    const hasUnreadMessages = useMemo(() => {
        return (
            Object.entries(unreadCount).some(
                ([userId, count]) => userId !== userInfo._id && count > 0
            ) ||
            (users && users.some((user) => user._id !== userInfo._id && user.unreadCount > 0))
        );
    }, [unreadCount]);
    useEffect(() => {
        const socket = connectSocket(userInfo._id, userInfo.role);
        socket.on("newMessage", (newMessage) => {
            dispatch(
                addUser({
                    ...newMessage,
                    currentUserId: userInfo._id,
                })
            );
        });

        return () => {
            socket.off("newMessage");
        };
    }, [selectedUser]);

    const [openDropdown, setOpenDropdown] = useState(null);

    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [user] = useState({
        firstName: "Admin",
        role: "Administrator",
    });

    const MENU_ITEMS = [
        {
            title: "Dashboard",
            to: "/admin/dashboard",
            icon: <TbDeviceAnalytics className="text-lg" />,
        },
        {
            title: "Booking",
            icon: <FaMoneyBillWave />,
            submenu: [
                {
                    title: "Tour Booking",
                    to: "/admin/booking/tour",
                },
                {
                    title: "Hotel Booking",
                    to: "/admin/booking/hotel",
                },
            ],
        },
        {
            title: "Tour",
            to: "/admin/manage-tours",
            icon: <FaUmbrellaBeach className="text-lg" />,
        },
        {
            title: "Khách sạn",
            to: "/admin/manage-hotels",
            icon: <FaHotel className="text-lg" />,
        },
        {
            title: "Thành phố",
            to: "/admin/manage-city",
            icon: <FaCity className="text-lg" />,
        },
        {
            title: "Tin nhắn",
            to: "/admin/chat",
            icon: (
                <div className="relative">
                    <BiSolidMessageDetail className="text-lg" />
                    {hasUnreadMessages && (
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                    )}
                </div>
            ),
            showNewBadge: hasUnreadMessages,
        },
    ];

    return (
        <div className="flex">
            <div
                className={`h-screen  fixed left-0 top-0 text-[#1a202e] transition-all duration-300 ${isCollapsed ? "w-16" : "w-[256px]"
                    }`}
            >
                <div className="py-4 flex items-center justify-center">
                    {!isCollapsed && <h1>Vagabond</h1>}
                </div>

                {!isCollapsed && (
                    <div className="flex flex-col items-center">
                        <Link
                            to="/admin/profile"
                            className="flex flex-col items-center hover:opacity-80 transition-opacity"
                        >
                            <FaUser className="w-10 h-10" />
                            <div className="mt-2 text-center">
                                <p className="text-sm font-medium text-gray-700">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{user?.role}</p>
                            </div>
                        </Link>
                    </div>
                )}

                <button
                    className="text-xl p-1 border rounded-full absolute right-0 top-0 translate-x-[50%] bg-white"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <MdKeyboardArrowRight /> : <MdKeyboardArrowLeft />}
                </button>

                <nav className="mt-5">
                    <ul className="space-y-1">
                        {MENU_ITEMS.map((item, index) => {
                            const isActive = location.pathname === item.to;
                            const isDropdownOpen = openDropdown === item.title;
                            return (
                                <li key={index} className="px-1">
                                    {item.submenu ? (
                                        <>
                                            <button
                                                onClick={() =>
                                                    setOpenDropdown(
                                                        isDropdownOpen ? null : item.title
                                                    )
                                                }
                                                className={`flex justify-between items-center w-full h-12 px-4 rounded-lg hover:bg-[#f2f2fc] ${isDropdownOpen && isActive ? "bg-[#f2f2fc]" : ""
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 flex items-center justify-center">
                                                        {item.icon}
                                                    </div>
                                                    {!isCollapsed && <span>{item.title}</span>}
                                                </div>
                                                {!isCollapsed && (
                                                    <MdKeyboardArrowRight
                                                        className={`transition-transform duration-300 text-[18px] ${isDropdownOpen ? "rotate-90" : ""
                                                            }`}
                                                    />
                                                )}
                                            </button>

                                            {!isCollapsed && isDropdownOpen && (
                                                <ul className="space-y-1">
                                                    {item.submenu.map((sub, subIdx) => (
                                                        <li key={subIdx}>
                                                            <Link
                                                                to={sub.to}
                                                                className={`block  pl-10 py-2 my-1 rounded hover:bg-[#f2f2fc] ${location.pathname === sub.to
                                                                        ? "bg-[#f2f2fc]"
                                                                        : "text-gray-700"
                                                                    }`}
                                                            >
                                                                {sub.title}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            to={item.to}
                                            className={`flex gap-3 items-center h-12 px-4 hover:bg-[#f2f2fc] rounded-lg ${isActive ? "bg-[#f2f2fc]" : ""
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 flex items-center justify-center">
                                                    {item.icon}
                                                </div>
                                                {!isCollapsed && <span>{item.title}</span>}
                                            </div>
                                            {!isCollapsed && item.showNewBadge && (
                                                <span className="text-xs font-semibold text-red-500">
                                                    Mới
                                                </span>
                                            )}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
            <main className={`flex-1 ${isCollapsed ? "pl-16" : "pl-[256px]"}`}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
