import { Modal } from "antd";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import dayjs from "dayjs";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineCalendarMonth } from "react-icons/md";
import "dayjs/locale/vi";
import { MainHeader } from "./MainHeader";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedDate } from "../redux/features/tourDateSlice";

dayjs.locale("vi");
const TicketSelection = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { ticket, tour } = location.state;

    const dispatch = useDispatch();
    const selectedDate = useSelector((state) => state.tourDate.selectedDate) || dayjs()
       

    const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

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
        const [open, setOpen] = useState(false);

        const [monthOffset, setMonthOffset] = useState(0);

        const baseMonth = today.startOf("month").add(monthOffset, "month");
        const months = [
            generateMonthDays(baseMonth),
            generateMonthDays(baseMonth.add(1, "month")),
        ];

        const handleSelect = (day) => {
            if (!day || day.isBefore(today, "day")) return;
            dispatch(setSelectedDate(day));
            setOpen(false);
        };

        const canGoBack = monthOffset > 0;

        return (
            <div>
                <div className="flex gap-3 ">
                    <div
                        onClick={() => setOpen(true)}
                        className="flex items-center justify-center border rounded-lg gap-2 bg-white shadow text-[#0194f3] flex-shrink-0 w-30 p-3"
                    >
                        <MdOutlineCalendarMonth className="w-6 h-6"></MdOutlineCalendarMonth>
                        <span className="font-semibold text-lg">Xem lịch</span>
                    </div>
                    <Modal
                        title={
                            <p className="font-semibold text-lg">Chọn ngày</p>
                        }
                        open={open}
                        onCancel={() => setOpen(false)}
                        footer={null}
                        width={700}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex gap-2"></div>
                        </div>

                        <div className="flex justify-between gap-6 relative">
                            <button
                                disabled={!canGoBack}
                                onClick={() =>
                                    setMonthOffset((prev) =>
                                        Math.max(prev - 1, 0)
                                    )
                                }
                                className={`px-3 py-1 rounded absolute ${
                                    canGoBack
                                        ? "text-[#0194f3]"
                                        : "text-[#cdd0d1]"
                                }`}
                            >
                                <IoIosArrowBack></IoIosArrowBack>
                            </button>
                            <button
                                onClick={() =>
                                    setMonthOffset((prev) => prev + 1)
                                }
                                className="px-3 py-1 rounded text-[#0194f3] absolute right-0"
                            >
                                <IoIosArrowForward></IoIosArrowForward>
                            </button>
                            {months.map((month, idx) => (
                                <div key={idx} className="flex-1">
                                    <h3 className="text-center font-semibold text-lg mb-2">
                                        {month.monthLabel}
                                    </h3>
                                    <div className="grid grid-cols-7 text-center text-gray-600 font-medium mb-1">
                                        {[
                                            "T2",
                                            "T3",
                                            "T4",
                                            "T5",
                                            "T6",
                                            "T7",
                                            "CN",
                                        ].map((d) => (
                                            <div key={d}>{d}</div>
                                        ))}
                                    </div>
                                    <div className="flex-1 grid grid-cols-7 text-center gap-y-1">
                                        {month.days.map((day, idx2) => {
                                            const isPast =
                                                !day ||
                                                day.isBefore(today, "day");
                                            const isSelected =
                                                day &&
                                                selectedDate &&
                                                day.isSame(
                                                    selectedDate,
                                                    "date"
                                                );

                                            return (
                                                <div
                                                    key={idx2}
                                                    onClick={() =>
                                                        handleSelect(day)
                                                    }
                                                    className={`px-3 py-1 rounded-lg transition-all ${
                                                        isPast
                                                            ? "text-gray-400"
                                                            : "cursor-pointer hover:bg-blue-100"
                                                    } ${
                                                        isSelected
                                                            ? "bg-[#0194f3] text-white"
                                                            : ""
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
                    <div className="flex-1 py-2 bg-[#ecf8ff] flex flex-col items-center justify-center rounded-lg">
                        <p className="font-bold text-secondary">
                            Ngày tham quan đã chọn
                        </p>
                        <p className="font-bold text-lg">
                            {selectedDate.format("D [thg] M YYYY")}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const PriceSelector = ({ prices }) => {
        const [quantities, setQuantities] = useState(
            Object.fromEntries(
                prices.map((item) => [item.priceType, item.minPerBooking])
            )
        );

        const increase = (priceType) => {
            setQuantities((prev) => ({
                ...prev,
                [priceType]: prev[priceType] + 1,
            }));
        };

        const decrease = (priceType) => {
            setQuantities((prev) => ({
                ...prev,
                [priceType]: Math.max(0, prev[priceType] - 1),
            }));
        };

        const totalPrice = prices.reduce(
            (sum, p) => sum + p.price * quantities[p.priceType],
            0
        );

        return (
            <div>
                <div className="py-6 mx-auto bg-white rounded-lg border border-gray-200 shadow-md mt-4 space-y-3">
                    <div className="divide-y-[1px] ">
                        {prices.map((p) => (
                            <div className="py-3 border-b-1 px-6">
                                <div className="flex justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold">
                                            {p.priceType}
                                        </h2>
                                        <p className="text-gray-600 text-sm">
                                            ({p.notes})
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={
                                                quantities[p.priceType] ===
                                                p.minPerBooking
                                            }
                                            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-300"
                                            onClick={() =>
                                                decrease(p.priceType)
                                            }
                                        >
                                            -
                                        </button>
                                        <div className="px-4 py-2 border rounded-md">
                                            {quantities[p.priceType]}
                                        </div>
                                        <button
                                            disabled={
                                                quantities[p.priceType] ===
                                                p.maxPerBooking
                                            }
                                            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-300"
                                            onClick={() =>
                                                increase(p.priceType)
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xl font-bold">
                                        {p.price.toLocaleString("vi-VN")} VND
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 px-6 border-t-[3px] border-gray-200">
                        <h2 className="text-lg text-gray-500 font-bold">
                            Tổng giá tiền
                        </h2>
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold text-[#fd5d1c] mt-2">
                                {totalPrice.toLocaleString("vi-VN")} VND
                            </p>
                            <button
                                className={`mt-2 px-6 py-3 font-semibold rounded ${
                                    totalPrice > 0
                                        ? "bg-[#fd5d1c] text-white "
                                        : "bg-gray-200 text-gray-400 pointer-events-none"
                                }`}
                                onClick={() =>
                                    navigate(`/tour/booking`, {
                                        state: {
                                            ticket,
                                            tour,
                                            quantities,
                                            passSelectedDate: selectedDate
                                        },
                                    })
                                }
                            >
                                Đặt ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const refundBeforeDays = Math.min(
        ...ticket.cancellationPolicy.refundPolicy.refundPercentage.map(
            (refund) => refund.daysBefore
        )
    );

    const refundDeadline = selectedDate
        .subtract(refundBeforeDays + 1, "day")
        .endOf("day");

    const isRefundable =
        ticket.cancellationPolicy.isRefund && dayjs().isBefore(refundDeadline);
    return (
        <div>
            <MainHeader />
            <div className="">
                <div className="pb-2 sticky top-0">
                    <div
                        onClick={() => navigate(`/tour/${tour.id}`)}
                        className="px-6 flex gap-3 items-center  cursor-pointer border-b-2 border-gray-200 py-2"
                    >
                        <FaArrowLeft></FaArrowLeft>
                        <p className="text-lg font-semibold">
                            Tìm phiếu du lịch khác
                        </p>
                    </div>
                </div>
                <div className="flex justify-between gap-5 mt-4 px-6 py-2">
                    <div className="w-[21%]">
                        <div className="border rounded-lg overflow-hidden">
                            <img
                                src={tour.img}
                                className="w-full object-cover"
                            ></img>
                            <div className="p-3">
                                <h2 className="font-semibold ">
                                    {ticket.title}
                                </h2>
                                <div className="flex flex-col gap-2 my-4">
                                    {isRefundable ? (
                                        <div className="bg-gray-100 p-2 rounded-lg text-yellow-400 font-semibold">
                                            Có thể hoàn tiền đến{" "}
                                            <span className="font-bold">
                                                {refundDeadline.format(
                                                    "D [thg] M YYYY"
                                                )}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-100 px-2 py-1 rounded-lg font-semibold">
                                            Không thể hoàn tiền
                                        </div>
                                    )}
                                    {ticket.cancellationPolicy.isReschedule ? (
                                        <div className="bg-gray-100 px-2 py-1 rounded-lg font-semibold">
                                            Có thể đổi lịch
                                        </div>
                                    ) : (
                                        <div className="bg-gray-100 px-2 py-1 rounded-lg font-semibold">
                                            Không thể đổi lịch
                                        </div>
                                    )}
                                </div>
                                <div className="pt-2 text-center border-t-2 border-dashed">
                                    <button
                                        onClick={() =>
                                            setIsTicketModalOpen(true)
                                        }
                                        className="text-base shadow-md font-bold text-blue_medium bg-[#f7f9fa] py-2 px-3 rounded-md"
                                    >
                                        Xem thông tin vé
                                    </button>
                                    <Modal
                                        title={
                                            <div className="font-semibold p-5 text-xl w-[650px]">
                                                {ticket.title}
                                            </div>
                                        }
                                        open={isTicketModalOpen}
                                        onCancel={() =>
                                            setIsTicketModalOpen(false)
                                        }
                                        footer={null}
                                        width={750}
                                        centered
                                        styles={{
                                            content: {
                                                fontSize: "16px",
                                                fontWeight: 500,
                                                padding: "0",
                                                overflow: "hidden",
                                            },
                                        }}
                                    >
                                        <div className="text-base h-[460px] overflow-auto ">
                                            <div className="px-5">
                                                <p className=" text-gray-500">
                                                    {ticket.description}
                                                </p>
                                                <div className="flex justify-between py-4 border-t-[1.5px] mt-4 border-dashed">
                                                    <div className="text-2xl font-bold text-orange_primary">
                                                        {ticket.prices[0].price.toLocaleString(
                                                            "vi-VN"
                                                        )}{" "}
                                                        VND
                                                    </div>
                                                    <div className="px-5 py-2 text-center bg-primary font-semibold text-white rounded-md cursor-pointer">
                                                        Chọn vé
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="">
                                                <div className="mt-2 py-2 px-5 border-t-[4px] border-gray-100">
                                                    <p className="text-xl font-bold">
                                                        Tổng quan
                                                    </p>
                                                    <div
                                                        className="dot ticket-overview px-3"
                                                        dangerouslySetInnerHTML={{
                                                            __html: ticket.overview,
                                                        }}
                                                    />
                                                </div>

                                                <div className="mt-4 px-5 border-t-[4px] py-2 border-gray-100">
                                                    <p className="text-xl font-bold">
                                                        Hiệu lực vourcher
                                                    </p>
                                                    <ul className="px-3 mt-2">
                                                        {ticket.voucherValidity
                                                            .split("\n")
                                                            .map((v, index) => (
                                                                <li
                                                                    key={index}
                                                                    className="flex gap-3"
                                                                >
                                                                    <span className="w-[7px] h-[7px] rounded-full bg-[#1f1f1f] mt-[10px]"></span>
                                                                    {v}
                                                                </li>
                                                            ))}
                                                    </ul>
                                                </div>
                                                <div className="mt-4 px-5 border-t-[4px] py-2 border-gray-100">
                                                    <p className="text-xl font-bold mb-3">
                                                        Phương thức quy đổi
                                                    </p>
                                                    <div className="border-t-[1.5px] border-dashed">
                                                        <p className="text-xl font-bold mt-3">
                                                            Cách đổi phiếu
                                                        </p>
                                                        <div
                                                            className="dot ticket-details px-3 mt-2 font-semibold"
                                                            dangerouslySetInnerHTML={{
                                                                __html: ticket
                                                                    .redemptionPolicy
                                                                    .method,
                                                            }}
                                                        />
                                                    </div>
                                                    {ticket.redemptionPolicy
                                                        .location && (
                                                        <div className="border-t-[1.5px] border-dashed">
                                                            <p className="text-xl font-bold mt-3">
                                                                Nơi đổi phiếu
                                                            </p>
                                                            <div
                                                                className="dot ticket-details px-3 mt-2 font-semibold"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: ticket
                                                                        .redemptionPolicy
                                                                        .location,
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-4 px-5 border-t-[4px] py-2 border-gray-100">
                                                    <p className="text-xl font-bold">
                                                        Hoàn tiền và đổi lịch
                                                    </p>
                                                    <div className="px-3 mt-2 mb-3">
                                                        {ticket
                                                            .cancellationPolicy
                                                            .isReschedule ? (
                                                            <p>
                                                                Có thể đổi lịch
                                                            </p>
                                                        ) : (
                                                            <p>
                                                                Không thể đổi
                                                                lịch
                                                            </p>
                                                        )}
                                                        {ticket
                                                            .cancellationPolicy
                                                            .isRefund ? (
                                                            <p>
                                                                Chỉ có thể yêu
                                                                cầu xử lý hoàn
                                                                tiền trước ngày
                                                                chọn.
                                                            </p>
                                                        ) : (
                                                            <p>
                                                                Không thể đổi
                                                                lịch
                                                            </p>
                                                        )}
                                                    </div>
                                                    {ticket.cancellationPolicy
                                                        .reschedulePolicy && (
                                                        <div className="border-t-[1.5px] border-dashed">
                                                            <p className="text-xl font-bold mt-3">
                                                                Chính sách đổi
                                                                lịch
                                                            </p>
                                                            <p>
                                                                {
                                                                    ticket
                                                                        .cancellationPolicy
                                                                        .reschedulePolicy
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                    {ticket.cancellationPolicy
                                                        .isRefund && (
                                                        <div className="border-t-[1.5px] border-dashed">
                                                            <p className="text-xl font-bold mt-2">
                                                                Chính sách hoàn
                                                                tiền
                                                            </p>
                                                            <ul className="px-3 mt-2">
                                                                <li className="">
                                                                    <div className="flex gap-3">
                                                                        <span className="w-[7px] h-[7px] rounded-full bg-[#1f1f1f] mt-[10px] flex-grow-0 flex-shrink-0"></span>
                                                                        Yêu cầu
                                                                        hoàn
                                                                        tiền
                                                                        muộn
                                                                        nhất là
                                                                    </div>
                                                                    <ul className="ml-4">
                                                                        {ticket.cancellationPolicy.refundPolicy.refundPercentage.map(
                                                                            (
                                                                                r
                                                                            ) => (
                                                                                <li>
                                                                                    <div className="flex gap-3">
                                                                                        <span className="w-[7px] h-[7px] rounded-full bg-[#1f1f1f] mt-[10px] flex-grow-0 flex-shrink-0"></span>
                                                                                        {
                                                                                            r.daysBefore
                                                                                        }{" "}
                                                                                        ngày
                                                                                        trước
                                                                                        ngày
                                                                                        đi
                                                                                        đã
                                                                                        chọn
                                                                                        của
                                                                                        bạn
                                                                                        để
                                                                                        nhận
                                                                                        được{" "}
                                                                                        {
                                                                                            r.percent
                                                                                        }

                                                                                        %
                                                                                        hoàn
                                                                                        tiền
                                                                                    </div>
                                                                                </li>
                                                                            )
                                                                        )}
                                                                    </ul>
                                                                </li>
                                                                {ticket.cancellationPolicy.refundPolicy.description
                                                                    .split("\n")
                                                                    .map(
                                                                        (
                                                                            r,
                                                                            index
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="flex gap-3"
                                                                            >
                                                                                <span className="w-[7px] h-[7px] rounded-full bg-[#1f1f1f] mt-[10px] flex-grow-0 flex-shrink-0"></span>
                                                                                {
                                                                                    r
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-4 px-5 border-t-[4px] py-2 border-gray-100">
                                                    <p className="text-xl font-bold">
                                                        Điều khoản & Điều kiện
                                                    </p>
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
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div>
                            <CalendarSelection></CalendarSelection>
                        </div>
                        <PriceSelector prices={ticket.prices}></PriceSelector>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketSelection;
