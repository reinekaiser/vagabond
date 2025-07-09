import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import dashboardService from "../../services/dashboardService";

const BookingsModal = ({ visible, onCancel, productId, productType, productName }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        if (visible && productId && productType) {
            fetchBookings();
        }
    }, [visible, productId, productType, pagination.page]);

    const fetchBookings = async () => {
        setLoading(true);
        setError(null);

        try {
            let response;
            if (productType === "tour") {
                response = await dashboardService.getBookingsByTour(
                    productId,
                    pagination.limit,
                    pagination.page
                );
            } else if (productType === "hotel") {
                response = await dashboardService.getBookingsByHotel(
                    productId,
                    pagination.limit,
                    pagination.page
                );
            }

            if (response) {
                setBookings(response.bookings || []);
                setPagination((prev) => ({
                    ...prev,
                    total: response.total || 0,
                    totalPages: response.totalPages || 0,
                }));
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            setError("Không thể tải danh sách booking");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa cập nhật";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Chờ xử lý" },
            confirmed: { bg: "bg-blue-100", text: "text-blue-800", label: "Đã xác nhận" },
            completed: { bg: "bg-green-100", text: "text-green-800", label: "Hoàn thành" },
            cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Đã hủy" },
        };

        const config = statusConfig[status] || statusConfig.pending;

        return (
            <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
            >
                {config.label}
            </span>
        );
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination((prev) => ({ ...prev, page: newPage }));
        }
    };

    if (loading) {
        return (
            <Modal
                open={visible}
                onCancel={onCancel}
                width={900}
                footer={null}
                centered
                title={
                    <p className="px-5 pb-2 pt-4 text-[18px]">Danh sách booking - ${productName}</p>
                }
                styles={{
                    content: {
                        padding: 0,
                        overflow: "hidden",
                    },
                    body: {
                        fontSize: "16px",
                    },
                    footer: {
                        padding: "16px",
                    },
                }}
            >
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Đang tải danh sách booking...</span>
                </div>
            </Modal>
        );
    }

    if (error) {
        return (
            <Modal
                open={visible}
                onCancel={onCancel}
                width={900}
                footer={null}
                title={
                    <p className="px-5 pb-2 pt-4 text-[18px]">Danh sách booking - ${productName}</p>
                }
                styles={{
                    content: {
                        padding: 0,
                        overflow: "hidden",
                    },
                    body: {
                        fontSize: "16px",
                    },
                    footer: {
                        padding: "16px",
                    },
                }}
                centered
            >
                <div className="flex flex-col items-center justify-center py-12">
                    <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Không thể tải danh sách
                    </h3>
                    <p className="text-gray-600 text-center mb-4">{error}</p>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            width={900}
            footer={null}
            title={<p className="px-5 pb-2 pt-4 text-[18px]">Danh sách booking - ${productName}</p>}
            styles={{
                content: {
                    padding: 0,
                    overflow: "hidden",
                },
                body: {
                    fontSize: "16px",
                },
                footer: {
                    padding: "16px",
                },
            }}
            centered
        >
            <div className="max-h-[70vh] overflow-y-auto p-6">
                {bookings.length > 0 ? (
                    <>
                        <div className="mb-4 flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                Tổng cộng {pagination.total} booking
                            </p>
                            <div className="text-sm text-gray-600">
                                Trang {pagination.page} / {pagination.totalPages}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {bookings.map((booking, index) => (
                                <div
                                    key={booking._id}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                {booking.name ||
                                                    `${booking.userId?.firstName || ""} ${
                                                        booking.userId?.lastName || ""
                                                    }`}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                ID: #{booking._id.slice(-8)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {getStatusBadge(booking.bookingStatus)}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {/* Email */}
                                        <div className="flex items-center space-x-2">
                                            <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">
                                                {booking.email ||
                                                    booking.userId?.email ||
                                                    "Chưa có email"}
                                            </span>
                                        </div>

                                        {/* Số điện thoại */}
                                        <div className="flex items-center space-x-2">
                                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">
                                                {booking.phone || "Chưa có SĐT"}
                                            </span>
                                        </div>

                                        {/* Tổng tiền */}
                                        <div className="flex items-center space-x-2">
                                            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-semibold text-green-600">
                                                {formatCurrency(booking.totalPrice)}
                                            </span>
                                        </div>

                                        {/* Ngày tạo */}
                                        <div className="flex items-center space-x-2">
                                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">
                                                {formatDate(booking.createdAt)}
                                            </span>
                                        </div>

                                        {/* Thông tin đặc biệt cho tour */}
                                        {productType === "tour" && booking.useDate && (
                                            <div className="flex items-center space-x-2">
                                                <CalendarIcon className="w-4 h-4 text-blue-400" />
                                                <span className="text-sm text-gray-700">
                                                    Ngày sử dụng: {formatDate(booking.useDate)}
                                                </span>
                                            </div>
                                        )}

                                        {/* Thông tin đặc biệt cho hotel */}
                                        {productType === "hotel" && (
                                            <>
                                                <div className="flex items-center space-x-2">
                                                    <CalendarIcon className="w-4 h-4 text-blue-400" />
                                                    <span className="text-sm text-gray-700">
                                                        Check-in: {formatDate(booking.checkin)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <CalendarIcon className="w-4 h-4 text-red-400" />
                                                    <span className="text-sm text-gray-700">
                                                        Check-out: {formatDate(booking.checkout)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700">
                                                        {booking.numRooms} phòng,{" "}
                                                        {booking.numGuests} khách
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Thông tin ticket cho tour */}
                                    {productType === "tour" && booking.ticketId && (
                                        <div className="mt-3 p-2 bg-blue-50 rounded">
                                            <p className="text-sm text-blue-800">
                                                Loại vé: {booking.ticketId.title}
                                            </p>
                                        </div>
                                    )}

                                    {/* Thông tin room type cho hotel */}
                                    {productType === "hotel" && booking.roomTypeId && (
                                        <div className="mt-3 p-2 bg-green-50 rounded">
                                            <p className="text-sm text-green-800">
                                                Loại phòng: {booking.roomTypeId.name}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="mt-6 flex justify-center items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                                    Trước
                                </button>

                                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                                    {pagination.page} / {pagination.totalPages}
                                </span>

                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="flex items-center px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau
                                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8">
                        <EyeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Chưa có booking nào
                        </h3>
                        <p className="text-gray-600">
                            {productType === "tour"
                                ? "Tour này chưa có booking nào"
                                : "Khách sạn này chưa có booking nào"}
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default BookingsModal;
