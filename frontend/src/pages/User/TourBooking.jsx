import React from "react";
import { MainHeader } from "../../components/MainHeader";
import { FaChevronLeft } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router";
import { useForm } from "react-hook-form";
import FormInput from "../../components/FormInput";
import { useState, useRef, useEffect } from "react";
import { Checkbox, Modal } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import FormTextArea from "../../components/FormTextArea";
import { useSelector } from "react-redux";
import {
    useCapturePaypalOrderAndSaveTourBookingMutation,
    useCreatePaypalOrderMutation,
    useCreateTourCheckoutSessionMutation,
    useCreateTourPayOSLinkMutation
} from "../../redux/api/tourBookingApiSlice";
dayjs.extend(customParseFormat);
dayjs.locale("vi");

const paymentOptions = [
    {
        id: "paypal",
        label: "PayPal",
        description:
            "Có thể phát sinh thêm phí nếu thanh toán bằng PayPal. Hãy liên hệ ngân hàng của bạn để cập nhật thêm thông tin.",
    },
    { id: "stripe", label: "Stripe" },
    {
        id: "qr",
        label: "Chuyển khoản qua QR",
        description: "Hoàn tiền không áp dụng cho lựa chọn thanh toán của bạn",
    },
];

const TourBooking = () => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        getValues,
        setValue,
        watch,
        reset,
    } = useForm();
    const location = useLocation();
    const navigate = useNavigate();
    const { ticket, tour, quantities, passSelectedDate } = location.state;
    console.log(ticket, tour, quantities, passSelectedDate);

    const [selectedMethod, setSelectedMethod] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const visibleOptions = isExpanded
        ? paymentOptions
        : paymentOptions.slice(0, 2);

    const selectedDate = dayjs(passSelectedDate.$d);

    const totalPrice = ticket.prices.reduce(
        (sum, p) => sum + p.price * quantities[p.priceType],
        0
    );

    const applyFor = Object.entries(quantities)
        .filter(([key, value]) => value > 0)
        .map(([key, value]) => `${key}: ${value}`)
        .join(",");

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

    const [createPaypalOrder, { isLoading: loadingCreatePaypal }] =
        useCreatePaypalOrderMutation();

    const [createStripeCheckout, { isLoading: loadingCreateStripe }] =
        useCreateTourCheckoutSessionMutation();

    const [createPayOSCheckout, { isLoading: loadingCreatePayOS }] =
        useCreateTourPayOSLinkMutation();
    const { user } = useSelector((state) => state.auth);

    const handlePayment = async () => {
        localStorage.setItem(
            "pendingTourBooking",
            JSON.stringify({
                userId: user ? user._id : null,
                tourId: tour.id,
                ticketId: ticket._id,
                tourImg: tour.img,
                quantities,
                useDate: selectedDate,
                phone: getValues("phone"),
                name: getValues("name"),
                email: getValues("email"),
                paymentMethod: selectedMethod,
                totalPrice: totalPrice,
            })
        );

        if (selectedMethod === "paypal") {
            try {
                const res = await createPaypalOrder({
                    amount: totalPrice,
                    tourId: tour.id,
                }).unwrap();

                window.location.href = res.approvalUrl;
            } catch (err) {
                console.error("PayPal redirect error", err);
            }
        } else if (selectedMethod === "stripe") {
            try {
                const res = await createStripeCheckout({
                    userId: user?._id,
                    tourId: tour.id,
                    tourName: tour.name,
                    tourImg: tour.img,
                    ticketName: ticket.title,
                    ticketId: ticket._id,
                    quantities,
                    useDate: selectedDate,
                    phone: getValues("phone"),
                    name: getValues("name"),
                    email: getValues("email"),
                    paymentMethod: selectedMethod,
                    totalPrice: totalPrice,
                }).unwrap();
                window.location.href = res.url;
            } catch (err) {
                console.error("Stripe redirect error", err);
            }
        } else if (selectedMethod === 'qr') {
            try {
                const res = await createPayOSCheckout({
                    userId: user?._id,
                    tourId: tour.id,
                    tourName: tour.name,
                    tourImg: tour.img,
                    ticketName: ticket.title,
                    ticketId: ticket._id,
                    quantities,
                    useDate: selectedDate,
                    phone: getValues("phone"),
                    name: getValues("name"),
                    email: getValues("email"),
                    paymentMethod: selectedMethod,
                    totalPrice: totalPrice,
                }).unwrap();
                
                window.location.href = res.checkoutUrl
            } catch (error) {
                console.error("Payos redirect error", error)
            }
        }
    };

    const isLoadingCheckoutButton = loadingCreatePaypal || loadingCreateStripe;
    return (
        <div className="bg-gray-100">
            <MainHeader />
            <div className="w-[80%] mx-auto mt-7">
                <div className="flex items-center">
                    <FaChevronLeft
                        className="mr-2 text-[14px] hover:text-slate-400 duration-300"
                        onClick={() => { }}
                    />
                    <p className="font-medium text-[16px]">Quay lại</p>
                </div>
                <div className="flex gap-5 mt-4">
                    <div className="w-[62%]">
                        <div className="mb-[100px]">
                            <form>
                                <div className="bg-white px-5 py-5 rounded-xl border shadow-sm">
                                    <h3 className="text-[20px] font-semibold">
                                        Thông tin khách
                                    </h3>

                                    <FormInput
                                        label={"Họ tên"}
                                        name={"name"}
                                        register={register}
                                        errors={errors}
                                        placeholder={"Nhập họ tên"}
                                    // validationRules = {{required: "Tên là bắt buộc"}}
                                    />

                                    <div className="flex gap-2 mt-4">
                                        <FormInput
                                            label={"Địa chỉ email"}
                                            name={"email"}
                                            register={register}
                                            errors={errors}
                                            placeholder={"Nhập địa chỉ email"}
                                            className="flex-1"
                                        // validationRules = {{required: "Email là bắt buộc"}}
                                        />
                                        <FormInput
                                            label={"Số điện thoại"}
                                            name={"phone"}
                                            register={register}
                                            errors={errors}
                                            placeholder={"Nhập số điện thoại"}
                                            className="flex-1"
                                        // validationRules = {{required: "Số điện thoại là bắt buộc"}}
                                        />
                                    </div>
                                </div>
                                <div className="bg-white px-5 py-5 rounded-xl mt-4 border shadow-sm">
                                    <p className="text-[20px] font-semibold">
                                        Yêu cầu thêm (tùy chọn)
                                    </p>
                                    <FormTextArea
                                        name={"request"}
                                        register={register}
                                        errors={errors}
                                        placeholder={"Yêu cầu đặc biệt"}
                                    ></FormTextArea>
                                </div>
                                <div className="bg-white px-5 py-7 rounded-xl mt-4 border shadow-sm">
                                    <h3 className="text-[20px] font-semibold mb-4">
                                        Kênh thanh toán
                                    </h3>
                                    <div className="">
                                        <div className="space-y-4">
                                            {visibleOptions.map((option) => (
                                                <div
                                                    key={option.id}
                                                    className="border rounded-lg p-4"
                                                >
                                                    <label className="flex items-start gap-3 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="payment"
                                                            value={option.id}
                                                            checked={
                                                                selectedMethod ===
                                                                option.id
                                                            }
                                                            onChange={() =>
                                                                setSelectedMethod(
                                                                    option.id
                                                                )
                                                            }
                                                            className="mt-1"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">
                                                                {option.label}
                                                            </span>
                                                            {option.description && (
                                                                <span className="text-sm text-gray-500">
                                                                    {
                                                                        option.description
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>

                                        <div
                                            onClick={() =>
                                                setIsExpanded(!isExpanded)
                                            }
                                            className="text-sm text-center text-gray-600 mt-4 cursor-pointer hover:underline select-none"
                                        >
                                            {isExpanded
                                                ? "Thu gọn"
                                                : "Hiển thị thêm"}
                                        </div>
                                    </div>
                                </div>
                            </form>
                            <div className="grid grid-cols-[70%_auto] bg-white p-5 rounded-xl mt-4 border shadow-sm">
                                <div className="flex items-start gap-2">
                                    <Checkbox />
                                    <span className="text-[13px] font-light">
                                        Tôi đã hiểu và đồng ý với Điều khoản sử
                                        dụng chung và Chính sách quyền riêng tư
                                        của vagabond
                                    </span>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        disabled={isLoadingCheckoutButton}
                                        onClick={handlePayment}
                                        className="bg-orange-600 rounded-xl px-6 py-2 text-white h-min"
                                    >
                                        Thanh toán ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="bg-white rounded-md border shadow-sm">
                            <p className="text-lg font-semibold px-4 py-2 ">
                                Tóm tắt đặt chỗ
                            </p>
                            <div className=" p-4 border-t">
                                <div className="flex gap-3">
                                    <img
                                        src={tour.img}
                                        alt="tour"
                                        className="w-20 h-16 object-cover rounded"
                                    />
                                    <div>
                                        <p className="font-medium line-clamp-1">
                                            {tour.name}
                                        </p>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {ticket.title}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-sm space-y-1 p-4 bg-blue-100">
                                <div className="grid grid-cols-2">
                                    <p className="text-gray-600">
                                        Ngày tham quan
                                    </p>
                                    <div>
                                        <span className="font-semibold">
                                            {selectedDate.isSame(dayjs())
                                                ? "Hôm nay"
                                                : selectedDate.day() === 0
                                                    ? "Chủ Nhật"
                                                    : `Thứ ${selectedDate.day() + 1
                                                    }`}
                                        </span>
                                        <span className="font-semibold">
                                            , {selectedDate.format("D [thg] M")}
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2">
                                    <p className="text-gray-600">Áp dụng cho</p>
                                    <div className="font-semibold">
                                        {applyFor}
                                    </div>
                                </div>
                            </div>
                            <div className="flex text-sm flex-col gap-2 p-4 text-gray-600 font-semibold">
                                {isRefundable ? (
                                    <div className="text-green-700">
                                        Có thể hoàn tiền đến{" "}
                                        <span className="font-bold">
                                            {refundDeadline.format(
                                                "D [thg] M YYYY"
                                            )}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="">Không thể hoàn tiền</div>
                                )}
                                {ticket.cancellationPolicy.isReschedule ? (
                                    <div className="">Có thể đổi lịch</div>
                                ) : (
                                    <div className="">Không thể đổi lịch</div>
                                )}
                                <TicketModal ticket={ticket}></TicketModal>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-4 bg-blue-950">
                <p className="text-white text-center text-[12px]">
                    Copyright © 2025 VagaBond. All rights reserved
                </p>
            </div>
        </div>
    );
};

const TicketModal = ({ ticket }) => {
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

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    };

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
        <div>
            <div>
                Để biết thêm chi tiết của vé này,{" "}
                <span
                    onClick={showViewModal}
                    className="text-blue-600 cursor-pointer"
                >
                    vui lòng xem tại đây
                </span>
            </div>
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
                        overflow: "hidden",
                    },
                }}
            >
                <div className="text-base h-[460px] relative overflow-auto">
                    <div className="px-5">
                        <p className=" text-gray-500">{ticket.description}</p>
                        <div className="sticky top-[172px] flex justify-between py-4 border-t-[1.5px] mt-4 border-dashed">
                            <div className="text-2xl font-bold text-orange_primary">
                                {ticket.prices[0].price.toLocaleString("vi-VN")}{" "}
                                VND
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
                                            ref={(el) =>
                                                (itemRefs.current[idx] = el)
                                            }
                                            onClick={() => handleClick(idx)}
                                            className={` font-medium ${idx === activeIndex
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
                            <p className="text-xl font-bold">
                                Hiệu lực vourcher
                            </p>
                            <ul className="px-3 mt-2">
                                {ticket.voucherValidity
                                    .split("\n")
                                    .map((v, index) => (
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
                                        __html: ticket.redemptionPolicy.method,
                                    }}
                                />
                            </div>
                            {ticket.redemptionPolicy.location && (
                                <div className="border-t-[1.5px] border-dashed">
                                    <p className="text-xl font-bold mt-3">
                                        Nơi đổi phiếu
                                    </p>
                                    <div
                                        className="dot ticket-details px-3 mt-2 font-semibold"
                                        dangerouslySetInnerHTML={{
                                            __html: ticket.redemptionPolicy
                                                .location,
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                        <div
                            ref={cancellationPolicyRef}
                            className="mt-4 px-5 border-t-[4px] py-2 border-gray-100"
                        >
                            <p className="text-xl font-bold">
                                Hoàn tiền và đổi lịch
                            </p>
                            <div className="px-3 mt-2 mb-3">
                                {ticket.cancellationPolicy.isReschedule ? (
                                    <p>Có thể đổi lịch</p>
                                ) : (
                                    <p>Không thể đổi lịch</p>
                                )}
                                {ticket.cancellationPolicy.isRefund ? (
                                    <p>
                                        Chỉ có thể yêu cầu xử lý hoàn tiền trước
                                        ngày chọn.
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
                                    <p>
                                        {
                                            ticket.cancellationPolicy
                                                .reschedulePolicy
                                        }
                                    </p>
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
                                                                {r.daysBefore}{" "}
                                                                ngày trước ngày
                                                                đi đã chọn của
                                                                bạn để nhận được{" "}
                                                                {r.percent}%
                                                                hoàn tiền
                                                            </div>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </li>
                                        {ticket.cancellationPolicy.refundPolicy.description
                                            .split("\n")
                                            .map((r, index) => (
                                                <li
                                                    key={index}
                                                    className="flex gap-3"
                                                >
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
    );
};

export default TourBooking;
