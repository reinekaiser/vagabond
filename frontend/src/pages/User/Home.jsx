import React, { useEffect } from "react";
import RenderModel from "../../components/three_model/RenderModel";
import Earth from "../../components/three_model/Earth";
import { PROMOTIONS } from "../../constants/index.js";
import GeneralCarousel from "../../components/GeneralCarousel";
import HomeTourList from "../../components/HomeTourList.jsx";
import HomeHotelList from "../../components/HomeHotelList.jsx";
import TourSearch from "../../components/TourSearch.jsx";
import { BiSupport } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useGetUserToChatQuery } from "../../redux/api/messageApiSlice";
import { addUser, setUsers } from "../../redux/features/chatSlice";
import { connectSocket } from "../../Utils/socket.js";
import { Tooltip, Dropdown } from "antd";
import { RiCustomerServiceFill, RiCustomerService2Fill } from "react-icons/ri";

const Home = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: userInfo } = useSelector((state) => state.auth);
    const { unreadCount, users } = useSelector((state) => state.chat);
    const { data: admin, isLoading: isLoadingAdmin } = useGetUserToChatQuery();
    useEffect(() => {
        if (!userInfo?._id || !userInfo?.role) return;
        const socket = connectSocket(userInfo._id, userInfo.role);
        socket.on("newMessage", (newMessage) => {
            const message = {
                ...newMessage,
                currentUserId: userInfo._id,
            };
            dispatch(addUser(message));
        });

        return () => {
            socket.off("newMessage");
        };
    }, [userInfo?._id, userInfo?.role]);
    useEffect(() => {
        if (admin) {
            dispatch(setUsers(admin));
        }
    }, [admin]);
    console.log("unread: ", unreadCount);

    const responsivePromotion = {
        desktop: {
            breakpoint: {
                max: 3000,
                min: 1024,
            },
            items: 3,
        },
        mobile: {
            breakpoint: {
                max: 464,
                min: 0,
            },
            items: 1,
        },
        tablet: {
            breakpoint: {
                max: 1024,
                min: 464,
            },
            items: 2,
        },
    };

    const items = [
        {
            key: "1",
            label: (
                <div
                    className="flex items-center min-w-[150px] text-base"
                    onClick={() => navigate(`/user/chatbot`)}
                >
                    Chat với Vagabond bot
                </div>
            ),
        },
        {
            key: "2",
            label: (
                <div
                    className="flex items-center min-w-[150px] text-base"
                    onClick={() => navigate(`/user/customer-support`)}
                >
                    Chat với nhân viên
                </div>
            ),
        },
    ];
    return (
        <div className="mb-20">
            <div className="bg-gradient-to-b from-[#00a4ff] to-white ">
                <div className="container mx-auto">
                    <div className="flex items-center gap-1">
                        <div className="w-[40%] bg-inherit">
                            <h2 className="text-6xl font-bold drop-shadow-lg">
                                Discover Your Next Adventure With Us
                            </h2>
                            <p className="text-[18px] mt-6 text-[#3d4856] font-medium">
                                Khám phá niềm vui của bạn mọi lúc, mọi nơi - từ chuyến du lịch ngẫu
                                hứng tới những cuộc phiêu lưu khắp thế giới
                            </p>
                        </div>
                        <div className="relative z-0 flex-1 h-[570px]">
                            <RenderModel>
                                <Earth />
                            </RenderModel>
                        </div>
                    </div>
                </div>
                <TourSearch></TourSearch>
            </div>
            {/*  */}

            <section className="mt-16 ">
                <div className="flex items-center gap-4 justify-center">
                    <h2 className="font-bold text-2xl">Ưu đãi cho bạn</h2>
                </div>
                <div className="container mx-auto relative mt-4">
                    <GeneralCarousel responsive={responsivePromotion}>
                        {PROMOTIONS.map((promotion, index) => (
                            <div key={index} className="h-[195px] rounded-lg">
                                <img
                                    src={promotion.img}
                                    className="rounded-lg w-full h-full object-cover"
                                    alt="promotion"
                                ></img>
                            </div>
                        ))}
                    </GeneralCarousel>
                </div>
            </section>
            <HomeTourList></HomeTourList>
            <HomeHotelList></HomeHotelList>

            <Tooltip
                title="Bạn có tin nhắn mới"
                open={unreadCount[users[0]?._id] > 0}
                placement="leftTop"
                color={"#108ee9"}
            >
                <Dropdown
                    menu={{ items }}
                    placement="topRight"
                    arrow
                    popupRender={(menu) => React.cloneElement(menu)}
                >
                    <div className="fixed bottom-1/4 right-14 w-14 h-14 bg-white text-white flex items-center justify-center rounded-full cursor-pointer shadow-md hover:shadow-lg transition duration-300 z-50">
                        <span className="text-[32px] text-blue-700">
                            <RiCustomerService2Fill />
                        </span>
                    </div>
                </Dropdown>
            </Tooltip>
        </div>
    );
};

export default Home;
