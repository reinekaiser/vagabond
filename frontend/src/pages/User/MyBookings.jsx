import React, {useState} from "react";
import { Tabs, Modal } from "antd";
import { CheckCircleIcon, XCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { IoReceiptOutline } from "react-icons/io5";
import { FaBuilding } from "react-icons/fa6";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { IoTicket } from "react-icons/io5";
import { useGetMyHotelBookingsQuery, useCancelBookingMutation } from "../../redux/api/hotelBookingApiSlice"
import { CLOUDINARY_BASE_URL } from "../../constants/hotel";
import { useCancelTourBookingMutation, useGetMyTourBookingsQuery } from "../../redux/api/tourBookingApiSlice";
import { IoTicketSharp } from "react-icons/io5";

const statusMap = {
  confirmed: {
    label: "Đã xác nhận",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircleIcon className="w-5 h-5 inline mr-1 text-[12px]" />,
  },
  pending: {
    label: "Chờ xác nhận",
    color: "bg-yellow-100 text-yellow-700",
    icon: <ClockIcon className="w-5 h-5 inline mr-1 text-[12px]" />,
  },
  cancelled: {
    label: "Đã hủy",
    color: "bg-red-100 text-red-700",
    icon: <XCircleIcon className="w-5 h-5 inline mr-1 text-[12px]" />,
  },
};

const HotelBookingsTab = () => {
  const { data: bookings = [], isLoading, refetch } = useGetMyHotelBookingsQuery();
  const [cancelBooking] = useCancelBookingMutation();

  const handleCancel = async (id) => {
    const confirm = window.confirm("Xác nhận huỷ?");
    if (!confirm) return;
    try {
      await cancelBooking(id).unwrap();
      toast.success("Đã huỷ đơn hàng thành công!");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Huỷ đơn hàng thất bại!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-600">
        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center py-8">
        <XCircleIcon className="w-20 h-20 text-gray-300 mb-4" />
        <div className="font-semibold text-lg mb-2">Chưa có đơn hàng</div>
        <div className="text-gray-500 text-center">
          Bạn chưa đặt đơn hàng nào. Hãy bắt đầu đặt phòng khách sạn từ trang chủ!
        </div>
      </div>
    );
  }

  return bookings.map((booking, index) => (
    <div
      key={index}
      className="bg-white rounded-md py-6 px-8 hover:shadow-lg duration-300 flex mb-4"
    >
      <div className="flex items-start mb-4 flex-1">
        <FaBuilding className="text-[18px] mr-2 mt-2 text-blue-400" />
        <div>
          <p className="font-semibold text-[18px]">{booking.hotelId.name} - {booking.roomTypeId.name}</p>
          <p className="text-gray-500 text-sm ml-2">
            {dayjs(booking.checkin).format("DD/MM/YYYY")} -{" "}
            {dayjs(booking.checkout).format("DD/MM/YYYY")} (
            {dayjs(booking.checkout).diff(dayjs(booking.checkin), "day")} đêm)
          </p>
          <p className='text-gray-500 text-sm ml-2'>
            {booking.numGuests} khách, {booking.numRooms} phòng
          </p>
          <p className="text-orange-600 font-medium mt-2">Tổng giá: {Number(booking.totalPrice).toLocaleString("vi-VN")} ₫</p>
          <div
            className={`inline-flex items-center mt-4 px-2 py-1 rounded-md text-[12px] font-medium ${statusMap[booking.bookingStatus]?.color}`}
          >
            {statusMap[booking.bookingStatus]?.icon}
            {statusMap[booking.bookingStatus]?.label}
          </div>
          {booking.bookingStatus === "pending" && (
            <div>
              <button
                onClick={() => handleCancel(booking._id)}
                className="text-[14px] font-medium mt-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200"
              >
                Huỷ đơn hàng
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="rounded-xl overflow-hidden h-[120px] w-[180px]">
        <img
          src={`${CLOUDINARY_BASE_URL}/${booking.hotelId.img[0]}`}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  ));
};

const TourBookingsTab = () => {
  const { data: bookings = [], isLoading, refetch } = useGetMyTourBookingsQuery();
  const [cancelBooking] = useCancelTourBookingMutation();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const showCancelModal = (id) => {
    setSelectedBookingId(id);
    setIsCancelModalOpen(true);
  };
  const confirmCancel = async () => {
    try {
      await cancelBooking(selectedBookingId).unwrap();
      toast.success("Đã huỷ đơn hàng thành công!");
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Huỷ đơn hàng thất bại!");
    } finally {
      setIsCancelModalOpen(false);
      setSelectedBookingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-600">
        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center text-gray-500">
        <IoTicket className="w-20 h-20 text-gray-300 mb-4" />
        <div className="font-semibold text-lg mb-2">Chưa có tour nào</div>
        <p>Bạn chưa đặt tour du lịch nào. Hãy khám phá các tour hấp dẫn ngay hôm nay!</p>
      </div>
    );
  }

  return bookings.map((booking, index) => (
    <div
      key={index}
      className="bg-white rounded-md py-6 px-8 hover:shadow-lg duration-300 flex mb-4"
    >
      <div className="flex items-start mb-4 w-full">
        <IoTicketSharp className="text-[18px] mr-2 mt-2 text-blue-400" />
        <div>
          <p className="font-semibold text-[18px]">{booking.tourId.name}</p>
          <p className="text-gray-500 text-sm truncate max-w-md mb-1">
            {booking.ticketId.title}
          </p>
          <p className="text-gray-500 text-sm">
            {dayjs(booking.date).format("DD/MM/YYYY")}
          </p>
          <p className="text-orange-600 font-medium mt-2">
            Tổng giá: {Number(booking.totalPrice).toLocaleString("vi-VN")} ₫
          </p>
          <div
            className={`inline-flex items-center mt-2 px-2 py-1 rounded-md text-[12px] font-medium ${statusMap[booking.bookingStatus]?.color}`}
          >
            {statusMap[booking.bookingStatus]?.icon}
            {statusMap[booking.bookingStatus]?.label}
          </div>
          {booking.bookingStatus === "pending" && (
            <div>
              <button
                onClick={() => showCancelModal(booking._id)}
                className="text-[14px] font-medium mt-2 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors duration-200"
              >
                Huỷ đơn hàng
              </button>
            </div>
          )}
          <Modal
            title="Xác nhận huỷ đơn hàng"
            open={isCancelModalOpen}
            onOk={confirmCancel}
            onCancel={() => setIsCancelModalOpen(false)}
            okText="Huỷ đơn"
            cancelText="Đóng"
            okButtonProps={{ danger: true }}
          >
            <p>Bạn có chắc chắn muốn huỷ đơn hàng này?</p>
          </Modal>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden h-[120px] w-[180px]">
        <img
          src={`${CLOUDINARY_BASE_URL}/${booking.tourId.images[0]}`}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  ));
};

const MyBookings = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <IoReceiptOutline className="w-7 h-7 text-blue-500" />
            Đơn hàng của bạn
          </h2>
          <Tabs
            defaultActiveKey="hotel"
            tabBarGutter={32}
            type="line"
            size="large"
            className="px-4 rounded-lg"
            items={[
              {
                key: "hotel",
                label: "Khách sạn",
                children: <HotelBookingsTab />,
              },
              {
                key: "tour",
                label: "Tour",
                children: <TourBookingsTab />,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default MyBookings;