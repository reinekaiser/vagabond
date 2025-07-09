import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { 
    UserIcon, 
    EnvelopeIcon, 
    PhoneIcon, 
    CalendarIcon,
    MapPinIcon,
    CurrencyDollarIcon,
    ExclamationTriangleIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    BuildingOfficeIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import dashboardService from '../../services/dashboardService';

const AllBookingsModal = ({ visible, onCancel }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        type: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        tourCount: 0,
        hotelCount: 0
    });

    useEffect(() => {
        if (visible) {
            fetchAllBookings();
        }
    }, [visible, pagination.page, filters]);

    const fetchAllBookings = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await dashboardService.getAllBookings(
                pagination.limit, 
                pagination.page, 
                filters.status, 
                filters.type
            );
            
            setBookings(response.bookings || []);
            setPagination(prev => ({
                ...prev,
                total: response.total || 0,
                totalPages: response.totalPages || 0,
                tourCount: response.tourCount || 0,
                hotelCount: response.hotelCount || 0
            }));
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            setError('Không thể tải danh sách booking');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
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

    const getTypeBadge = (type) => {
        return type === 'tour' ? (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                <TruckIcon className="w-3 h-3 mr-1" />
                Tour
            </span>
        ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                <BuildingOfficeIcon className="w-3 h-3 mr-1" />
                Hotel
            </span>
        );
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    };

    const resetFilters = () => {
        setFilters({ status: '', type: '' });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    if (loading && bookings.length === 0) {
        return (
            <Modal
                open={visible}
                onCancel={onCancel}
                width={1200}
                footer={null}
                title="Tất Cả Booking"
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
                width={1200}
                footer={null}
                title="Tất Cả Booking"
            >
                <div className="flex flex-col items-center justify-center py-12">
                    <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải danh sách</h3>
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
            width={1200}
            footer={null}
            title="Tất Cả Booking"
        >
            <div className="max-h-[80vh] overflow-y-auto">
                {/* Filters */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex items-center space-x-4 flex-wrap">
                        <div className="flex items-center space-x-2">
                            <FunnelIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>
                        </div>
                        
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả loại</option>
                            <option value="tour">Tour</option>
                            <option value="hotel">Khách sạn</option>
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ xử lý</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="completed">Hoàn thành</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>

                        <button
                            onClick={resetFilters}
                            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm text-gray-700 transition-colors"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Tổng Booking</p>
                        <p className="text-xl font-bold text-blue-800">{pagination.total}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Tour Booking</p>
                        <p className="text-xl font-bold text-green-800">{pagination.tourCount}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Hotel Booking</p>
                        <p className="text-xl font-bold text-purple-800">{pagination.hotelCount}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-sm text-orange-600 font-medium">Trang</p>
                        <p className="text-xl font-bold text-orange-800">{pagination.page}/{pagination.totalPages}</p>
                    </div>
                </div>

                {/* Bookings List */}
                {bookings.length > 0 ? (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            {getTypeBadge(booking.type)}
                                            <h4 className="text-lg font-semibold text-gray-900">
                                                {booking.customerName}
                                            </h4>
                                        </div>
                                        <p className="text-sm text-gray-600">ID: #{booking._id.slice(-8)}</p>
                                        <p className="text-sm font-medium text-blue-600">{booking.serviceName}</p>
                                        {booking.serviceLocation && (
                                            <p className="text-xs text-gray-500">{booking.serviceLocation}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        {getStatusBadge(booking.bookingStatus)}
                                        <p className="text-sm font-semibold text-green-600 mt-1">
                                            {formatCurrency(booking.totalPrice)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Email */}
                                    <div className="flex items-center space-x-2">
                                        <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-700 truncate">
                                            {booking.customerEmail || 'Chưa có email'}
                                        </span>
                                    </div>

                                    {/* Phone */}
                                    {booking.phone && (
                                        <div className="flex items-center space-x-2">
                                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-700">{booking.phone}</span>
                                        </div>
                                    )}

                                    {/* Created Date */}
                                    <div className="flex items-center space-x-2">
                                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-700">
                                            {formatDate(booking.createdAt)}
                                        </span>
                                    </div>

                                    {/* Type specific info */}
                                    {booking.type === 'tour' && booking.useDate && (
                                        <div className="flex items-center space-x-2">
                                            <CalendarIcon className="w-4 h-4 text-blue-400" />
                                            <span className="text-sm text-gray-700">
                                                Sử dụng: {formatDate(booking.useDate)}
                                            </span>
                                        </div>
                                    )}

                                    {booking.type === 'hotel' && (
                                        <>
                                            <div className="flex items-center space-x-2">
                                                <CalendarIcon className="w-4 h-4 text-blue-400" />
                                                <span className="text-sm text-gray-700">
                                                    {formatDate(booking.checkin)} - {formatDate(booking.checkout)}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <UserIcon className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-700">
                                                    {booking.numRooms} phòng, {booking.numGuests} khách
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Additional info */}
                                {booking.type === 'tour' && booking.ticketType && (
                                    <div className="mt-3 p-2 bg-blue-50 rounded">
                                        <p className="text-sm text-blue-800">Loại vé: {booking.ticketType}</p>
                                    </div>
                                )}

                                {booking.type === 'hotel' && booking.roomType && (
                                    <div className="mt-3 p-2 bg-green-50 rounded">
                                        <p className="text-sm text-green-800">Loại phòng: {booking.roomType}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <BuildingOfficeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có booking nào</h3>
                        <p className="text-gray-600">Chưa có booking nào phù hợp với bộ lọc của bạn</p>
                    </div>
                )}

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
            </div>
        </Modal>
    );
};

export default AllBookingsModal; 