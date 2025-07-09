import React, { useState } from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import AllBookingsModal from './AllBookingsModal';

const RecentBookings = ({ bookings }) => {
    const [allBookingsModalVisible, setAllBookingsModalVisible] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xử lý' },
            confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã xác nhận' },
            completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoàn thành' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const getProductIcon = (type) => {
        if (type === 'tour') {
            return (
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-xs font-semibold">T</span>
                </div>
            );
        } else {
            return (
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-xs font-semibold">H</span>
                </div>
            );
        }
    };

    // Fallback data when no real bookings available
    const fallbackBookings = [
        {
            _id: "eea94c",
            type: "tour",
            serviceName: "Tour vịnh Hạ Long trên du thuyền 5 sao Cozy Bay Premium - Tour 1 ngày",
            customerName: "Như Quỳnh",
            bookingStatus: "pending",
            createdAt: new Date('2025-05-31')
        },
        {
            _id: "ca956d",
            type: "hotel",
            serviceName: "Norfolk Mansion Luxury Serviced Apartment",
            customerName: "Pham Nguyen",
            bookingStatus: "pending",
            createdAt: new Date('2025-05-31')
        },
        {
            _id: "161b97",
            type: "tour",
            serviceName: "Địa đạo Củ Chi - Tour nửa ngày SST Travel",
            customerName: "Pham Trung Nguyen",
            bookingStatus: "pending",
            createdAt: new Date('2025-05-31')
        },
        {
            _id: "a50590",
            type: "tour",
            serviceName: "Địa đạo Củ Chi - Tour nửa ngày SST Travel",
            customerName: "Pham Trung Nguyen",
            bookingStatus: "pending",
            createdAt: new Date('2025-05-30')
        },
        {
            _id: "a757ca",
            type: "tour",
            serviceName: "Địa đạo Củ Chi - Tour nửa ngày SST Travel",
            customerName: "Ngô Quyền",
            bookingStatus: "confirmed",
            createdAt: new Date('2025-05-30')
        }
    ];

    const displayBookings = bookings.length > 0 ? bookings : fallbackBookings;

    const handleViewAllBookings = () => {
        setAllBookingsModalVisible(true);
    };

    const handleCloseAllBookingsModal = () => {
        setAllBookingsModalVisible(false);
    };

    return (
        <>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Đơn Hàng Gần Đây</h3>
                    <button 
                        onClick={handleViewAllBookings}
                        className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                    >
                        Xem Tất Cả
                    </button>
                </div>

                <div className="overflow-hidden">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-0 text-sm font-medium text-gray-600">Sản phẩm</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Khách hàng</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mã đơn</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Ngày</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {displayBookings.map((booking, index) => (
                                <tr key={booking._id || index} className="hover:bg-gray-50">
                                    <td className="py-4 px-0">
                                        <div className="flex items-center space-x-3">
                                            {getProductIcon(booking.type)}
                                            <span className="text-sm font-medium text-gray-900">
                                                {booking.serviceName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm text-gray-900">{booking.customerName}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm font-mono text-blue-600">
                                            #{booking._id.slice(-6)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm text-gray-500">
                                            {formatDate(booking.createdAt)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        {getStatusBadge(booking.bookingStatus)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AllBookingsModal
                visible={allBookingsModalVisible}
                onCancel={handleCloseAllBookingsModal}
            />
        </>
    );
};

export default RecentBookings; 