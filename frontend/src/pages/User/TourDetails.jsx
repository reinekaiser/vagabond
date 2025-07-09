import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useGetTourDetailsQuery } from "../../redux/api/tourApiSlice";
import { Modal } from "antd";
import { useState, useEffect, useRef } from "react";
import "react-multi-carousel/lib/styles.css";
import TourInformationUser from "../../components/TourInformationUser";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { CLOUDINARY_BASE_URL } from "../../constants/hotel";
import dayjs from "dayjs";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import "dayjs/locale/vi";
import "react-multi-carousel/lib/styles.css";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDate } from "../../redux/features/tourDateSlice";
import { Box, CircularProgress } from "@mui/material";
import { useGetReviewByProductIdQuery } from "../../redux/api/reviewApiSlice";
import { BsStarFill, BsStarHalf, BsStar } from "react-icons/bs";
import { FaStar, FaStarHalf, FaRegStar } from "react-icons/fa6";
dayjs.extend(isSameOrBefore);
dayjs.locale("vi");

const TourDetails = () => {
    const params = useParams();
    const navigate = useNavigate();
    const { data, isLoading, refetch } = useGetTourDetailsQuery(params._id);

    const location = useLocation();

    useEffect(() => {
        const url = new URL(window.location.href);

        if (url.searchParams.has("token")) {
            url.searchParams.delete("token");

            window.history.replaceState({}, "", url.pathname + url.search);
        }
    }, []);

    const dispatch = useDispatch();

    const selectedDate = useSelector((state) => state.tourDate.selectedDate);

    const [isCalendarModal, setIsCalendarModal] = useState(false);

    const { data: tourRiview, isLoading: isLoadingTourReviews } = useGetReviewByProductIdQuery({
        reviewableId: params._id,
        reviewableType: "Tour",
    });

    const CalendarSelection = () => {
        const generateMonthDays = (baseMonth) => {
            const daysInMonth = baseMonth.daysInMonth();
            const firstDay = baseMonth.startOf("month").day(); // 0 = Sunday
            const offset = firstDay === 0 ? 6 : firstDay - 1; // Adjust to make Monday first

            const days = [];
            for (let i = 0; i < offset; i++) days.push(null);

            for (let i = 1; i <= daysInMonth; i++) {
                days.push(baseMonth.date(i));
            }

            return {
                monthLabel: baseMonth.format("[tháng] M [năm] YYYY"),
                days,
                startOfMonth: baseMonth,
            };
        };

        const today = dayjs().startOf("day");

        const [monthOffset, setMonthOffset] = useState(0);

        const baseMonth = today.startOf("month").add(monthOffset, "month");
        const months = [generateMonthDays(baseMonth), generateMonthDays(baseMonth.add(1, "month"))];

        const handleNextMonth = () => {
            if (monthOffset < 3) {
                setMonthOffset((prev) => prev + 1);
            }
        };

        const handlePrevMonth = () => {
            if (monthOffset > 0) {
                setMonthOffset((prev) => prev - 1);
            }
        };

        const handleSelect = (day) => {
            if (!day || day.isBefore(today, "day")) return;
            dispatch(setSelectedDate(day));
            setIsCalendarModal(false);
        };

        const canGoBack = monthOffset > 0;
        const canGoForward = monthOffset < 3;

        return (
            <div>
                <div className="flex gap-3 cursor-pointer">
                    {selectedDate ? (
                        <div
                            onClick={() => setIsCalendarModal(true)}
                            className="flex flex-col items-center justify-center border rounded-lg w-[128px] text-[#0194f3] h-[70px]"
                        >
                            <span className="text-sm font-medium">
                                {selectedDate.isSame(dayjs())
                                    ? "Hôm nay"
                                    : selectedDate.day() === 0
                                    ? "Chủ Nhật"
                                    : `Thứ ${selectedDate.day() + 1}`}
                            </span>
                            <span className="text-base font-bold">
                                {selectedDate.format("D [thg] M")}
                            </span>
                        </div>
                    ) : (
                        <div
                            onClick={() => setIsCalendarModal(true)}
                            className="flex items-center justify-center border rounded-lg gap-2 bg-white shadow text-[#0194f3] flex-shrink-0 w-[128px] h-[70px] p-3"
                        >
                            <MdOutlineCalendarMonth className="w-6 h-6"></MdOutlineCalendarMonth>
                            <span className="font-semibold text-lg">Xem lịch</span>
                        </div>
                    )}

                    <Modal
                        title={<p className="font-semibold text-lg">Chọn ngày</p>}
                        open={isCalendarModal}
                        onCancel={() => setIsCalendarModal(false)}
                        footer={null}
                        width={700}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-2"></div>
                        </div>

                        <div className="flex justify-between gap-6 relative">
                            <button
                                disabled={!canGoBack}
                                onClick={handlePrevMonth}
                                className={`px-3 py-1 text-lg rounded absolute ${
                                    canGoBack ? "text-[#0194f3]" : "text-[#cdd0d1]"
                                }`}
                            >
                                <IoIosArrowBack></IoIosArrowBack>
                            </button>
                            <button
                                onClick={handleNextMonth}
                                disabled={!canGoForward}
                                className={`px-3 py-1 text-lg rounded absolute right-0 ${
                                    canGoForward ? "text-[#0194f3]" : "text-[#cdd0d1]"
                                }`}
                            >
                                <IoIosArrowForward></IoIosArrowForward>
                            </button>
                            {months.map((month, idx) => (
                                <div key={idx} className="flex-1">
                                    <h3 className="text-center font-semibold text-lg mb-2">
                                        {month.monthLabel}
                                    </h3>
                                    <div className="grid grid-cols-7 text-center text-gray-600 font-medium mb-1">
                                        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((d) => (
                                            <div key={d}>{d}</div>
                                        ))}
                                    </div>
                                    <div className="flex-1 grid grid-cols-7 text-center gap-y-1">
                                        {month.days.map((day, idx2) => {
                                            const isPast = !day || day.isBefore(today, "day");
                                            const isSelected =
                                                day &&
                                                selectedDate &&
                                                day.isSame(selectedDate, "date");

                                            return (
                                                <div
                                                    key={idx2}
                                                    onClick={() => handleSelect(day)}
                                                    className={`px-3 py-2 rounded-lg transition-all ${
                                                        isPast
                                                            ? "text-gray-400"
                                                            : "cursor-pointer hover:bg-blue-100"
                                                    } ${
                                                        isSelected ? "bg-[#0194f3] text-white" : ""
                                                    }`}
                                                >
                                                    {day && (
                                                        <div className="text-base">
                                                            {day.date()}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Modal>
                </div>
            </div>
        );
    };
    const TicketCard = ({ ticket }) => {
        const [isViewModalOpen, setIsViewModalOpen] = useState(false);
        const showViewModal = () => {
            setIsViewModalOpen(true);
        };

        const handleCancelViewModal = () => {
            setIsViewModalOpen(false);
        };

        const sections = [
            "Tổng quan",
            "Hiệu lực voucher",
            "Phương thức quy đổi",
            "Chính sách hủy đặt chỗ",
            "Điều khoản và điều kiện",
        ];
        const [activeIndex, setActiveIndex] = useState(0);

        const itemRefs = useRef([]);

        const [indicatorStyle, setIndicatorStyle] = useState({
            left: 0,
            width: 79,
        });

        const overviewRef = useRef(null);
        const voucherValidityRef = useRef(null);
        const redemptionPolicyRef = useRef(null);
        const cancellationPolicyRef = useRef(null);
        const termsAndConditionsRef = useRef(null);
        const sectionRefs = [
            overviewRef,
            voucherValidityRef,
            redemptionPolicyRef,
            cancellationPolicyRef,
            termsAndConditionsRef,
        ];

        // Scroll tới section tương ứng
        const scrollToSection = (ref) => {
            ref.current?.scrollIntoView({ behavior: "smooth" });
        };

        // Cập nhật thanh highlight
        useEffect(() => {
            const currentRef = itemRefs.current[activeIndex];
            if (currentRef) {
                const { offsetLeft, offsetWidth } = currentRef;
                setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
            }
        }, [activeIndex]);

        const handleClick = (index) => {
            setActiveIndex(index);
            scrollToSection(sectionRefs[index]);
        };

        return (
            <div className="flex items-start px-4 py-2 border rounded-lg">
                <div className="w-[72%]">
                    <p className="text-xl font-bold pr-[60px]">{ticket.title}</p>
                    <p
                        onClick={showViewModal}
                        className="text-blue-500 font-semibold mt-4 cursor-pointer"
                    >
                        Xem chi tiết
                    </p>
                    <Modal
                        title={
                            <div className="font-semibold p-5 text-xl w-[650px]">
                                {ticket.title}
                            </div>
                        }
                        open={isViewModalOpen}
                        onCancel={handleCancelViewModal}
                        footer={null}
                        width={800}
                        centered
                        styles={{
                            content: {
                                fontSize: "16px",
                                fontWeight: 500,
                                padding: "0",
                                overflow: "hidden"
                            },
                        }}
                    >
                        <div className="text-base h-[460px] overflow-auto">
                            <div className="px-5">
                                <p className=" text-gray-500">{ticket.description}</p>
                                <div className="sticky top-0 flex justify-between py-4 border-t-[1.5px] mt-4 border-dashed">
                                    <div className="text-2xl font-bold text-orange_primary">
                                        {ticket.prices[0].price.toLocaleString("vi-VN")} VND
                                    </div>
                                    <div
                                        onClick={() => {
                                            if (!selectedDate) {
                                                setIsCalendarModal(true);
                                            } else {
                                                navigate(`/tour/${data.tour._id}/${ticket._id}`, {
                                                    state: {
                                                        ticket,

                                                        tour: {
                                                            id: data.tour._id,
                                                            name: data.tour.name,
                                                            img: `${CLOUDINARY_BASE_URL}/${data.tour.images[0]}`,
                                                        },
                                                    },
                                                });
                                            }
                                        }}
                                        className="px-5 py-2 text-center bg-primary font-semibold text-white rounded-md cursor-pointer"
                                    >
                                        Chọn vé
                                    </div>
                                </div>
                            </div>
                            <div className="">
                                <div className="relative mt-2 py-2 px-5 border-t-[4px] border-gray-100">
                                    <div className="sticky top-0 bg-white z-10">
                                        <div className="flex justify-between">
                                            {sections.map((label, idx) => (
                                                <button
                                                    key={idx}
                                                    ref={(el) => (itemRefs.current[idx] = el)}
                                                    onClick={() => handleClick(idx)}
                                                    className={` font-medium ${
                                                        idx === activeIndex
                                                            ? "text-primary"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Thanh highlight */}
                                    <div
                                        className="absolute bottom-0 h-[2px] bg-primary transition-all duration-300"
                                        style={{
                                            left: indicatorStyle.left + 20,
                                            width: indicatorStyle.width,
                                        }}
                                    />
                                </div>
                                <div
                                    ref={overviewRef}
                                    className="mt-2 py-2 px-5 border-t-[4px] border-gray-100"
                                >
                                    <div
                                        className="dot ticket-overview px-3"
                                        dangerouslySetInnerHTML={{
                                            __html: ticket.overview,
                                        }}
                                    />
                                </div>

                                <div
                                    ref={voucherValidityRef}
                                    className="mt-4 px-5 border-t-[4px] py-2 border-gray-100"
                                >
                                    <p className="text-xl font-bold">Hiệu lực vourcher</p>
                                    <ul className="px-3 mt-2">
                                        {ticket.voucherValidity.split("\n").map((v, index) => (
                                            <li key={index} className="flex gap-3">
                                                <span className="w-[7px] h-[7px] rounded-full bg-[#1f1f1f] mt-[10px]"></span>
                                                {v}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div
                                    ref={redemptionPolicyRef}
                                    className="mt-4 px-5 border-t-[4px] py-2 border-gray-100"
                                >
                                    <p className="text-xl font-bold mb-3">Phương thức quy đổi</p>
                                    <div className="border-t-[1.5px] border-dashed">
                                        <p className="text-xl font-bold mt-3">Cách đổi phiếu</p>
                                        <div
                                            className="dot ticket-details px-3 mt-2 font-semibold"
                                            dangerouslySetInnerHTML={{
                                                __html: ticket.redemptionPolicy.method,
                                            }}
                                        />
                                    </div>
                                    {ticket.redemptionPolicy.location && (
                                        <div className="border-t-[1.5px] border-dashed">
                                            <p className="text-xl font-bold mt-3">Nơi đổi phiếu</p>
                                            <div
                                                className="dot ticket-details px-3 mt-2 font-semibold"
                                                dangerouslySetInnerHTML={{
                                                    __html: ticket.redemptionPolicy.location,
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div
                                    ref={cancellationPolicyRef}
                                    className="mt-4 px-5 border-t-[4px] py-2 border-gray-100"
                                >
                                    <p className="text-xl font-bold">Hoàn tiền và đổi lịch</p>
                                    <div className="px-3 mt-2 mb-3">
                                        {ticket.cancellationPolicy.isReschedule ? (
                                            <p>Có thể đổi lịch</p>
                                        ) : (
                                            <p>Không thể đổi lịch</p>
                                        )}
                                        {ticket.cancellationPolicy.isRefund ? (
                                            <p>
                                                Chỉ có thể yêu cầu xử lý hoàn tiền trước ngày chọn.
                                            </p>
                                        ) : (
                                            <p>Không thể đổi lịch</p>
                                        )}
                                    </div>
                                    {ticket.cancellationPolicy.reschedulePolicy && (
                                        <div className="border-t-[1.5px] border-dashed">
                                            <p className="text-xl font-bold mt-3">
                                                Chính sách đổi lịch
                                            </p>
                                            <p>{ticket.cancellationPolicy.reschedulePolicy}</p>
                                        </div>
                                    )}
                                    {ticket.cancellationPolicy.isRefund && (
                                        <div className="border-t-[1.5px] border-dashed">
                                            <p className="text-xl font-bold mt-2">
                                                Chính sách hoàn tiền
                                            </p>
                                            <ul className="px-3 mt-2">
                                                <li className="">
                                                    <div className="flex gap-3">
                                                        <span className="w-[7px] h-[7px] rounded-full bg-[#1f1f1f] mt-[10px] flex-grow-0 flex-shrink-0"></span>
                                                        Yêu cầu hoàn tiền muộn nhất là
                                                    </div>
                                                    <ul className="ml-4">
                                                        {ticket.cancellationPolicy.refundPolicy.refundPercentage.map(
                                                            (r) => (
                                                                <li>
                                                                    <div className="flex gap-3">
                                                                        <span className="w-[7px] h-[7px] rounded-full bg-[#1f1f1f] mt-[10px] flex-grow-0 flex-shrink-0"></span>
                                                                        {r.daysBefore} ngày trước
                                                                        ngày đi đã chọn của bạn để
                                                                        nhận được {r.percent}% hoàn
                                                                        tiền
                                                                    </div>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </li>
                                                {ticket.cancellationPolicy.refundPolicy.description
                                                    .split("\n")
                                                    .map((r, index) => (
                                                        <li key={index} className="flex gap-3">
                                                            <span className="w-[7px] h-[7px] rounded-full bg-[#1f1f1f] mt-[10px] flex-grow-0 flex-shrink-0"></span>
                                                            {r}
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div
                                    ref={termsAndConditionsRef}
                                    className="mt-4 px-5 border-t-[4px] py-2 border-gray-100"
                                >
                                    <p className="text-xl font-bold">Điều khoản & Điều kiện</p>
                                    <div
                                        className="dot ticket-overview px-3"
                                        dangerouslySetInnerHTML={{
                                            __html: ticket.termsAndConditions,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Modal>
                </div>
                <div className="flex flex-1 flex-col justify-between ">
                    <div className="text-xl font-semibold text-orange_primary">
                        {ticket.prices[0].price.toLocaleString("vi-VN")} VND
                    </div>
                    <div
                        onClick={() => {
                            if (!selectedDate) {
                                setIsCalendarModal(true);
                            } else {
                                navigate(`/tour/${data.tour._id}/${ticket._id}`, {
                                    state: {
                                        ticket,
                                        tour: {
                                            id: data.tour._id,
                                            name: data.tour.name,
                                            img: `${CLOUDINARY_BASE_URL}/${data.tour.images[0]}`,
                                        },
                                    },
                                });
                            }
                        }}
                        className="w-full py-2 text-center mt-[28px] bg-primary font-semibold text-white rounded-md cursor-pointer"
                    >
                        Chọn vé
                    </div>
                </div>
            </div>
        );
    };

    const ticketSectionRef = useRef(null);

    const scrollToTicketSection = () => {
        ticketSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const reviewSectionRef = useRef(null);

    const scrollToReviwSection = () => {
        reviewSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    if (isLoading || isLoadingTourReviews)
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );

    const latestByUser = new Map();

    for (const item of tourRiview.reviews) {
        const userId = item.userId._id;
        const existing = latestByUser.get(userId);

        if (!existing || new Date(item.createdAt) > new Date(existing.createdAt)) {
            latestByUser.set(userId, item);
        }
    }

    const latestReview = Array.from(latestByUser.values());
    return (
        <div className="relative mb-20">
            <div className="bg-[#329ee5] h-[300px] w-full absolute top-0 -z-10 rounded-br-[48px]"></div>
            <div className="w-[80%] mx-auto bg-transparent">
                <TourInformationUser
                    tourData={{
                        ...data.tour,
                        numReview: tourRiview.reviews.length,
                        reviews: latestReview,
                    }}
                    scrollToTicket={scrollToTicketSection}
                    scrollToReview={scrollToReviwSection}
                ></TourInformationUser>
                <div ref={ticketSectionRef} className="mt-2 p-6 border rounded-lg shadow-md">
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-xl">Có vé trống cho bạn</p>
                        <CalendarSelection></CalendarSelection>
                    </div>
                    <div className="mt-4 space-y-4 ">
                        {data.tickets.map((ticket, index) => (
                            <TicketCard key={index} ticket={ticket}></TicketCard>
                        ))}
                    </div>
                </div>
                <div className="mt-6" ref={reviewSectionRef}>
                    <p className="text-2xl font-bold">Đánh giá</p>
                    <div className="flex mt-4 gap-4 items-center">
                        <div className="text-3xl font-bold">
                            {tourRiview.averageRating}
                            <span className="text-gray-400 text-sm ">/5</span>
                        </div>
                        <div className=" text-yellow-400 flex items-center gap-2">
                            <StarRating
                                rating={tourRiview.averageRating}
                                className={"text-yellow-400 flex items-center gap-2"}
                            ></StarRating>
                        </div>
                        <p className="text-base">
                            Dựa trên {tourRiview.reviews.length} lượt đánh giá
                        </p>
                    </div>{" "}
                    <div className="flex flex-col gap-5 mt-5">
                        {latestReview.map((r, index) => (
                            <div className="text-sm w-full min-h-[200px] flex gap-4 items-start rounded-lg p-4 shadow">
                                <div className="w-[215px]">
                                    <div className="flex items-center gap-2">
                                        {r.userId.profilePicture ? (
                                            <img
                                                src={r.userId.profilePicture}
                                                className="w-[44px] h-[44px] rounded-full"
                                            ></img>
                                        ) : (
                                            <div className="w-[44px] h-[44px] rounded-full flex items-center justify-center bg-[#8dbd8b] text-gray-200">
                                                <span>
                                                    {r.userId.firstName[0]} {r.userId.lastName[0]}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-0.5">
                                            <p className="font-semibold">
                                                {r.userId.firstName} {r.userId.lastName}
                                            </p>
                                            <p className="text-gray-400">
                                                {dayjs(r.createdAt).format("DD/MM/YYYY")}
                                            </p>
                                        </div>
                                    </div>
                                    <StarRating
                                        rating={r.rating}
                                        className={"text-yellow-400 flex items-center gap-2 mt-2"}
                                    ></StarRating>
                                </div>
                                <div className="flex-1 text-base">
                                    <p className="">{r.comment}</p>
                                    {r.images.length > 0 && (
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                            {r.images.slice(0, 3).map((img, idx) => (
                                                <img
                                                    key={idx}
                                                    src={`${CLOUDINARY_BASE_URL}/${img}`}
                                                    alt={`r-img-${idx}`}
                                                    className="w-24 h-24 object-cover rounded-md"
                                                />
                                            ))}
                                            {r.images.length > 3 && (
                                                <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-600 text-sm font-medium">
                                                    +{r.images.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StarRating = ({ rating, className }) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
        <div className={className}>
            {[...Array(fullStars)].map((_, i) => (
                <BsStarFill key={`f-${i}`} />
            ))}
            {hasHalf && <BsStarHalf />}
            {[...Array(emptyStars)].map((_, i) => (
                <BsStar key={`e-${i}`} />
            ))}
        </div>
    );
};

export default TourDetails;
