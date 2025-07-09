import { MainHeader } from "../../components/MainHeader";
import { FaChevronLeft } from "react-icons/fa6";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { CircularProgress, Box } from "@mui/material";
import FormInput from "../../components/FormInput";
import { useState, useRef } from "react";
import { Checkbox, Modal } from "antd";
import { TbBuildingSkyscraper } from "react-icons/tb";
import { useGetHotelByIdQuery } from "../../redux/api/hotelApiSlice";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { VscCoffee } from "react-icons/vsc";
import { LuBedDouble } from "react-icons/lu";
import { TbCoffeeOff } from "react-icons/tb";
import { TbCoffee } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
import { BiArea } from "react-icons/bi";
import { PiMountainsDuotone } from "react-icons/pi";
import { IoBedOutline } from "react-icons/io5";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FaCircleCheck } from "react-icons/fa6";
import { LuCircleDollarSign } from "react-icons/lu";
import { CLOUDINARY_BASE_URL } from "../../constants/hotel";
import { useSelector } from "react-redux";
import {
    useCreateBookingMutation,
    useCreateHotelCheckoutSessionMutation,
    useCreateHotelPaypalOrderMutation,
    useCreateHotelPayOSLinkMutation
} from "../../redux/api/hotelBookingApiSlice";
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

const HotelBooking = () => {
    const navigate = useNavigate();
    const param = useParams();
    const [searchParams] = useSearchParams();
    const location = searchParams.get("location");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const rooms = parseInt(searchParams.get("rooms"));
    const adults = parseInt(searchParams.get("adults"));
    const roomTypeId = searchParams.get("roomTypeId");
    const roomId = searchParams.get("roomId");

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm();

    const { user } = useSelector((state) => state.auth);
    const { data: hotel, isLoading: isLoadingHotel } = useGetHotelByIdQuery(
        param._id
    );
    const [createHotelBooking] = useCreateBookingMutation();

    const [selectedMethod, setSelectedMethod] = useState("paypal");
    const [visibleModal, setVisibleModal] = useState(false);

    const showModal = () => {
        setVisibleModal(true);
    };
    const closeModal = () => {
        setVisibleModal(false);
    };

    if (isLoadingHotel) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    const getNumberOfNights = (checkIn, checkOut) => {
        const dateIn = dayjs(checkIn, "DD/MM/YYYY");
        const dateOut = dayjs(checkOut, "DD/MM/YYYY");
        return dateIn.isValid() && dateOut.isValid()
            ? dateOut.diff(dateIn, "day")
            : 0;
    };

    const getRoomPrice = (room, checkIn, checkOut, quantity = 1) => {
        const nights = getNumberOfNights(checkIn, checkOut);
        const pricePerNight = room.price || 0;
        const total = nights * pricePerNight * quantity;

        return Number(total);
    };

    const roomType = hotel?.roomTypes.find(
        (roomType) => roomType._id === roomTypeId
    );
    const room = roomType?.rooms.find((room) => room._id === roomId);

    const [createPaypalOrder, { isLoading: loadingCreatePaypal }] =
        useCreateHotelPaypalOrderMutation();
    const [createStripeCheckout, { isLoading: loadingCreateStripe }] =
        useCreateHotelCheckoutSessionMutation();
    const [createPayOSCheckout, { isLoading: loadingCreatePayOS }] =
        useCreateHotelPayOSLinkMutation();

    const handlePayment = async (e) => {
        e.preventDefault();
        localStorage.setItem(
            "pendingHotelBooking",
            JSON.stringify({
                userId: user?._id,
                hotelId: param._id,
                roomTypeId,
                roomId,
                checkin: checkIn,
                checkout: checkOut,
                numGuests: adults,
                numRooms: rooms,
                phone: getValues("phone"),
                name: getValues("name"),
                email: getValues("email"),
                paymentMethod: selectedMethod,
                totalPrice: getRoomPrice(room, checkIn, checkOut, rooms),
            })
        );

        if (selectedMethod === "paypal") {
            try {
                const res = await createPaypalOrder({
                    amount: getRoomPrice(room, checkIn, checkOut, rooms),
                    hotelId: param._id,
                    location,
                    checkIn,
                    checkOut,
                    rooms,
                    adults,
                    roomTypeId,
                    roomId,
                }).unwrap();

                window.location.href = res.approvalUrl;
            } catch (err) {
                console.error("PayPal redirect error", err);
            }
        } else if (selectedMethod === "stripe") {
            try {
                const res = await createStripeCheckout({
                    hotelName: hotel.name,
                    location,
                    roomTypeName: roomType.name,
                    roomTypeImg: roomType.img[0],
                    userId: user?._id,
                    hotelId: param._id,
                    roomTypeId,
                    roomId,
                    checkin: checkIn,
                    checkout: checkOut,
                    numGuests: adults,
                    numRooms: rooms,
                    phone: getValues("phone"),
                    name: getValues("name"),
                    email: getValues("email"),
                    paymentMethod: selectedMethod,
                    totalPrice: getRoomPrice(room, checkIn, checkOut, rooms),
                }).unwrap();
                window.location.href = res.url;
            } catch (err) {
                console.error("Stripe redirect error", err);
            }
        } else if (selectedMethod === 'qr') {
            try {
                const res = await createPayOSCheckout({
                    hotelName: hotel.name,
                    location,
                    roomTypeName: roomType.name,
                    roomTypeImg: roomType.img[0],
                    userId: user?._id,
                    hotelId: param._id,
                    roomTypeId,
                    roomId,
                    checkin: checkIn,
                    checkout: checkOut,
                    numGuests: adults,
                    numRooms: rooms,
                    phone: getValues("phone"),
                    name: getValues("name"),
                    email: getValues("email"),
                    paymentMethod: selectedMethod,
                    totalPrice: getRoomPrice(room, checkIn, checkOut, rooms),
                }).unwrap();

                window.location.href = res.checkoutUrl

            } catch (error) {
                console.error("Payos redirect error", error)
            }
        }
    };

    const isLoadingCheckoutButton = loadingCreatePaypal || loadingCreateStripe;

    return (
        <div className="bg-gray-100 ">
            <MainHeader />
            <div className="container w-[82%] mx-auto">
                <div className=" grid grid-cols-[62%_35%] gap-5">
                    <div className="">
                        <div className="flex items-center mb-2 mt-7 ml-2">
                            <FaChevronLeft
                                className="mr-2 text-[14px] hover:text-slate-400 duration-300"
                                onClick={() =>
                                    navigate(
                                        `/hotels/${param._id
                                        }?${searchParams.toString()}`
                                    )
                                }
                            />
                            <p className="font-medium text-[16px]">Quay lại</p>
                        </div>
                        <div className="mb-[100px]">
                            <form id="bookingHotelForm">
                                <div className="bg-white px-5 py-7 rounded-3xl">
                                    <p className="text-[20px] font-semibold">
                                        Thông tin nhận phòng
                                    </p>
                                    <p className="font-medium text-end">
                                        {rooms} Phòng
                                    </p>
                                    <div className="h-[1px] bg-gray-200 my-3"></div>
                                    <p className="text-[18px] font-semibold mb-2">
                                        Thông tin khách
                                    </p>
                                    <FormInput
                                        label={"Họ tên"}
                                        name={"name"}
                                        register={register}
                                        errors={errors}
                                        placeholder={"Nhập họ tên"}
                                    // validationRules = {{required: "Tên là bắt buộc"}}
                                    />
                                </div>
                                <div className="bg-white px-5 py-7 rounded-3xl mt-4">
                                    <h3 className="text-[20px] font-semibold">
                                        Thông tin liên lạc
                                    </h3>
                                    <FormInput
                                        label={"Địa chỉ email"}
                                        name={"email"}
                                        register={register}
                                        errors={errors}
                                        placeholder={"Nhập địa chỉ email"}
                                    // validationRules = {{required: "Email là bắt buộc"}}
                                    />
                                    <FormInput
                                        className="mt-4"
                                        label={"Số điện thoại"}
                                        name={"phone"}
                                        register={register}
                                        errors={errors}
                                        placeholder={"Nhập số điện thoại"}
                                    // validationRules = {{required: "Số điện thoại là bắt buộc"}}
                                    />
                                </div>
                                <div className="bg-white px-5 py-7 rounded-3xl mt-4">
                                    <h3 className="text-[20px] font-semibold mb-4">
                                        Kênh thanh toán
                                    </h3>
                                    <PaymentMethodSelector
                                        selectedMethod={selectedMethod}
                                        setSelectedMethod={setSelectedMethod}
                                    />
                                </div>

                                <div className="grid grid-cols-[70%_auto] bg-white p-5 rounded-3xl mt-4">
                                    <div className="flex items-start gap-2">
                                        <Checkbox />
                                        <span className="text-[13px] font-light">
                                            Tôi đã hiểu và đồng ý với Điều khoản
                                            sử dụng chung và Chính sách quyền
                                            riêng tư của vagabond
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
                            </form>
                        </div>
                    </div>
                    <div className="mt-[60px]">
                        <div className="bg-white p-5 rounded-3xl mb-4">
                            <div className="flex items-start pb-3 border-b border-gray-200">
                                <TbBuildingSkyscraper className="text-[22px] mr-2" />
                                <p className="text-[16px]">{hotel?.name}</p>
                            </div>
                            <div className="flex py-4 border-b border-gray-200">
                                <span>{checkIn}</span>
                                <span className="flex-1 text-gray-500 font-light text-center">
                                    {getNumberOfNights(checkIn, checkOut)} đêm
                                </span>
                                <span>{checkOut}</span>
                            </div>
                            <div className="pt-4 pb-2">
                                <div
                                    key={roomType._id}
                                    className="grid grid-cols-[65%_35%]"
                                >
                                    <span className="text-[20px] font-semibold">
                                        {roomType.name}
                                    </span>
                                    <div className="rounded-xl overflow-hidden h-[70px]">
                                        <img
                                            src={`${CLOUDINARY_BASE_URL}/${roomType.img[0]}`}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div key={room._id} className="mt-2">
                                        <div className="flex items-center font-light mb-2">
                                            <VscCoffee className="mr-2" />
                                            <span>{room.serveBreakfast}</span>
                                        </div>
                                        <div className="flex items-center font-light mb-4">
                                            <LuBedDouble className="mr-2" />{" "}
                                            {room.bedType}
                                        </div>
                                        <div
                                            className="hover:underline duration-300"
                                            onClick={showModal}
                                        >
                                            Xem chi tiết phòng
                                        </div>
                                        <RoomModal
                                            roomType={roomType}
                                            room={room}
                                            closeModal={closeModal}
                                            visibleModal={visibleModal}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-3xl grid grid-cols-2">
                            <div className="w-full space-y-2">
                                <p>Mỗi phòng / đêm</p>
                                <p>
                                    {rooms} phòng x{" "}
                                    {getNumberOfNights(checkIn, checkOut)} đêm
                                </p>
                                <p className="font-semibold">
                                    Số tiền thanh toán
                                </p>
                            </div>
                            <div className="w-full text-right space-y-2">
                                <p>
                                    {Number(room.price).toLocaleString("vi-VN")}{" "}
                                    ₫
                                </p>
                                <p>
                                    {getRoomPrice(
                                        room,
                                        checkIn,
                                        checkOut,
                                        rooms
                                    ).toLocaleString("vi-VN")}{" "}
                                    ₫
                                </p>
                                <p className="text-orange-500 text-[20px] font-semibold">
                                    {getRoomPrice(
                                        room,
                                        checkIn,
                                        checkOut,
                                        rooms
                                    ).toLocaleString("vi-VN")}{" "}
                                    ₫
                                </p>
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

const RoomModal = ({
    roomType,
    room,
    closeModal,
    visibleModal,
    review = 1,
}) => {
    const infoRef = useRef(null);
    const priceRef = useRef(null);
    const policyRef = useRef(null);

    const scrollToRef = (ref) => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <Modal
            open={visibleModal}
            onCancel={closeModal}
            footer={null}
            closable={false}
            title={null}
            style={{ top: 0 }}
            width={600}
            className="custom-right-modal"
        >
            <div className="bg-white sticky top-0 z-10">
                <div className="flex justify-end px-5 pt-5">
                    <button onClick={closeModal} className="text-xl font-bold">
                        <IoMdClose className="text-[24px]" />
                    </button>
                </div>
                <div className="flex gap-5 py-3 border-b shadow pl-7">
                    <button
                        onClick={() => scrollToRef(infoRef)}
                        className="hover:text-orange-500"
                    >
                        Thông tin phòng
                    </button>
                    <button
                        onClick={() => scrollToRef(priceRef)}
                        className="hover:text-orange-500"
                    >
                        Giá chi tiết
                    </button>
                    <button
                        onClick={() => scrollToRef(policyRef)}
                        className="hover:text-orange-500"
                    >
                        Chính sách chỗ lưu trú
                    </button>
                </div>
            </div>

            <div className="">
                <div ref={infoRef} className="px-7 py-5 bg-white">
                    <div className="overflow-hidden rounded-xl h-[280px] mb-4">
                        <img
                            src={`${CLOUDINARY_BASE_URL}/${roomType.img[0]}`}
                            alt="only"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-7 bg-orange-500 rounded"></div>
                        <h2 className="text-[20px] font-semibold">
                            {roomType.name}
                        </h2>
                    </div>
                    {roomType.area && (
                        <p className="flex items-center text-sm mt-3 ml-3">
                            <BiArea className="text-lg mr-1" />
                            {roomType.area} m²
                        </p>
                    )}
                    {roomType.view && (
                        <p className="flex items-center text-sm mt-2 ml-3">
                            <PiMountainsDuotone className="text-lg mr-1" />
                            {roomType.view}
                        </p>
                    )}

                    <div className="border-b my-5"></div>

                    {room.serveBreakfast == "Bao gồm bữa sáng" ? (
                        <p className="text-[14px] flex items-center text-[#00828A] mb-2 ml-3">
                            <TbCoffee className="text-[18px] mr-2" />
                            {room.serveBreakfast}
                        </p>
                    ) : (
                        <p className="text-[14px] flex items-center text-gray-600 mb-2 ml-3">
                            <TbCoffeeOff className="text-[18px] mr-2" />
                            {room.serveBreakfast}
                        </p>
                    )}

                    <p className="text-[14px] flex items-center text-gray-600 mb-2 ml-3">
                        <IoBedOutline className="text-[18px] mr-2" />
                        {room.bedType}
                    </p>

                    <p className="text-[14px] flex items-center text-gray-600 mb-2 ml-3">
                        <MdOutlinePeopleAlt className="text-[18px] mr-2" />
                        Phòng dành cho {room.maxOfGuest} người lớn. Lựa chọn phù
                        hợp với tổng số khách lưu trú.
                    </p>

                    <h3 className="ml-3 my-3 font-bold text-[18px]">
                        Tiện ích Phòng
                    </h3>
                    {roomType.roomFacilities.map((item, index) => (
                        <p
                            key={index}
                            className="flex items-center text-gray-600 text-[16px] ml-3 mb-1"
                        >
                            <IoMdCheckmarkCircleOutline className="text-[18px] mr-2" />
                            {item}
                        </p>
                    ))}
                </div>

                <div ref={priceRef} className="mt-2 bg-white px-7 py-5">
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-7 bg-orange-500 rounded"></div>
                        <h2 className="text-[20px] font-semibold">
                            Giá chi tiết
                        </h2>
                    </div>
                    <div>
                        {review == 1 && (
                            <div className="flex justify-end">
                                <div className="text-[18px] font-semibold inline-block">
                                    {Number(room.price).toLocaleString("vi-VN")}{" "}
                                    ₫
                                    <p className="text-[12px] font-normal text-gray-400">
                                        Giá mỗi phòng/đêm
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div
                    ref={policyRef}
                    className="mt-2 bg-white px-7 py-5 text-[16px]"
                >
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="w-2 h-7 bg-orange-500 rounded"></div>
                        <h2 className="text-[20px] font-semibold">
                            Chính sách chỗ lưu trú
                        </h2>
                    </div>
                    <div className="mb-3">
                        <p className="font-semibold">Xác nhận tức thời</p>
                        <p>Nhận xác nhận đặt phòng chỉ trong vài phút</p>
                    </div>

                    <div>
                        {review == 1 &&
                            (room.cancellationPolicy.refund ===
                                "Không hoàn tiền" ? (
                                <div className="mb-2">
                                    <p className="font-semibold">
                                        {room.cancellationPolicy.refund}
                                    </p>
                                    <p>
                                        Sau khi xác nhận, đơn hàng của bạn không
                                        thể huỷ hoặc sửa đổi
                                    </p>
                                </div>
                            ) : room.cancellationPolicy.refund ===
                                "Hủy miễn phí" ? (
                                <div className="mb-2">
                                    <p className="font-semibold">
                                        Miễn phí huỷ (Thời gian có hạn)
                                    </p>
                                    <p>
                                        Lưu ý: Phí hủy sẽ tùy thuộc vào số lượng
                                        phòng đã đặt. Tất cả thời gian được liệt
                                        kê đều tính theo giờ địa phương của
                                        khách sạn.
                                    </p>
                                    <div className="py-2 px-4 space-y-1 bg-blue-50 rounded-lg text-[16px] font-light">
                                        <div className="flex items-center gap-1 mb-1">
                                            <FaCircleCheck className="text-green-500" />
                                            <p className="font-semibold ">
                                                Huỷ miễn phí
                                            </p>
                                        </div>
                                        <p className="mx-4">
                                            Hủy miễn phí trước{" "}
                                            <span className="font-medium">
                                                {room.cancellationPolicy.day}
                                            </span>{" "}
                                            từ ngày đặt{" "}
                                        </p>
                                        <div className="flex items-center gap-2 mb-1">
                                            <LuCircleDollarSign />
                                            <p className="font-semibold">
                                                Sau thời hạn "Hủy miễn phí"
                                            </p>
                                        </div>
                                        <p className="mx-4">
                                            Nếu huỷ sau ngày đặt sẽ tính phí
                                            100% trên tổng giá
                                        </p>
                                        <p className="mx-4">
                                            Việc hủy/thay đổi đặt chỗ sau thời
                                            gian nhận phòng hoặc không hoàn
                                            thành nhận phòng sẽ chịu phí phạt có
                                            thể lên đến 100% giá trị đặt phòng,
                                            theo quyết định của khách sạn
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-2">
                                    <p className="font-semibold">
                                        Miễn phí huỷ (Thời gian có hạn)
                                    </p>
                                    <p>
                                        Lưu ý: Phí hủy sẽ tùy thuộc vào số lượng
                                        phòng đã đặt. Tất cả thời gian được liệt
                                        kê đều tính theo giờ địa phương của
                                        khách sạn.
                                    </p>
                                    <div className="py-2 px-4 space-y-1 bg-blue-50 rounded-lg text-[16px] font-light">
                                        <div className="flex items-center gap-1 mb-1">
                                            <LuCircleDollarSign />
                                            <p className="font-semibold">
                                                Phí huỷ được áp dụng như sau:
                                            </p>
                                        </div>
                                        <p className="mx-4">
                                            Nếu bạn hủy trước{" "}
                                            <span className="font-medium">
                                                {" "}
                                                {room.cancellationPolicy.day} từ
                                                ngày đặt{" "}
                                            </span>
                                            bạn sẽ phải trả phí hủy là{" "}
                                            <span className="font-medium">
                                                {Math.round(
                                                    room.price *
                                                    (room.cancellationPolicy
                                                        .percentBeforeDay /
                                                        100)
                                                ).toLocaleString("vi-VN")}
                                                ₫
                                            </span>
                                        </p>
                                        <p className="mx-4">
                                            Nếu bạn hủy sau ngày đặt bạn sẽ phải
                                            trả phí hủy là{" "}
                                            <span className="font-medium">
                                                {Math.round(
                                                    room.price *
                                                    (room.cancellationPolicy
                                                        .percentAfterDay /
                                                        100)
                                                ).toLocaleString("vi-VN")}
                                                ₫
                                            </span>
                                        </p>
                                        <p className="mx-4">
                                            Việc hủy/thay đổi đặt chỗ sau thời
                                            gian nhận phòng hoặc không hoàn
                                            thành nhận phòng sẽ chịu phí phạt có
                                            thể lên đến 100% giá trị đặt phòng,
                                            theo quyết định của khách sạn
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const PaymentMethodSelector = ({ selectedMethod, setSelectedMethod }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const visibleOptions = isExpanded
        ? paymentOptions
        : paymentOptions.slice(0, 2);

    return (
        <div className="">
            <div className="space-y-4">
                {visibleOptions.map((option) => (
                    <div key={option.id} className="border rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="payment"
                                value={option.id}
                                checked={selectedMethod === option.id}
                                onChange={() => setSelectedMethod(option.id)}
                                className="mt-1"
                            />
                            <div className="flex flex-col">
                                <span className="font-medium">
                                    {option.label}
                                </span>
                                {option.description && (
                                    <span className="text-sm text-gray-500">
                                        {option.description}
                                    </span>
                                )}
                            </div>
                        </label>
                    </div>
                ))}
            </div>

            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-center text-gray-600 mt-4 cursor-pointer hover:underline select-none"
            >
                {isExpanded ? "Thu gọn" : "Hiển thị thêm"}
            </div>
        </div>
    );
};

export default HotelBooking;
