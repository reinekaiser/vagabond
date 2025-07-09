import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { 
    UserIcon, 
    EnvelopeIcon, 
    PhoneIcon, 
    CalendarIcon,
    MapPinIcon,
    GlobeAltIcon,
    XMarkIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import dashboardService from '../../services/dashboardService';

const UserInfoModal = ({ visible, onCancel, userId }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (visible && userId) {
            fetchUserDetails();
        }
    }, [visible, userId]);

    const fetchUserDetails = async () => {
        setLoading(true);
        setError(null);
        setUser(null);
        
        try {
            const response = await dashboardService.getUserById(userId);
            if (response.success) {
                setUser(response.data.user);
            } else {
                setError(response.message || 'Không thể tải thông tin khách hàng');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            setError('Không tìm thấy thông tin khách hàng hoặc có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa cập nhật';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const getGenderText = (gender) => {
        switch (gender) {
            case 'male': return 'Nam';
            case 'female': return 'Nữ';
            case 'other': return 'Khác';
            default: return 'Chưa cập nhật';
        }
    };

    if (loading) {
        return (
            <Modal
                open={visible}
                onCancel={onCancel}
                width={600}
                footer={null}
                title="Thông tin khách hàng"
            >
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Đang tải thông tin...</span>
                </div>
            </Modal>
        );
    }

    if (error) {
        return (
            <Modal
                open={visible}
                onCancel={onCancel}
                width={600}
                footer={null}
                title="Thông tin khách hàng"
            >
                <div className="flex flex-col items-center justify-center py-12">
                    <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải thông tin</h3>
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
            width={600}
            footer={null}
            title="Thông tin khách hàng"
        >
            {user && (
                <div className="p-6">
                    {/* Header với avatar và tên */}
                    <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            {user.profilePicture || user.avatar ? (
                                <img 
                                    src={user.profilePicture || user.avatar} 
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-white text-xl font-bold">
                                    {getInitials(user.firstName, user.lastName)}
                                </span>
                            )}
                        </div>
                        
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                {user.firstName} {user.lastName}
                            </h3>
                            {/* <p className="text-sm text-gray-500">
                                {user.username || 'Chưa có tên người dùng'}
                            </p> */}
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-green-100 text-green-800'
                            } mt-1`}>
                                {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                            </div>
                        </div>
                    </div>

                    {/* Thông tin chi tiết */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <EnvelopeIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-gray-900 font-medium">{user.email}</p>
                            </div>
                        </div>

                        {/* Số điện thoại */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <PhoneIcon className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Số điện thoại</p>
                                <p className="text-gray-900 font-medium">{user.phoneNumber || 'Chưa cập nhật'}</p>
                            </div>
                        </div>

                        {/* Giới tính */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Giới tính</p>
                                <p className="text-gray-900 font-medium">{getGenderText(user.gender)}</p>
                            </div>
                        </div>

                        {/* Ngày sinh */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <CalendarIcon className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Ngày sinh</p>
                                <p className="text-gray-900 font-medium">{formatDate(user.dateOfBirth)}</p>
                            </div>
                        </div>

                        {/* Thành phố */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <MapPinIcon className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Thành phố</p>
                                <p className="text-gray-900 font-medium">{user.city || 'Chưa cập nhật'}</p>
                            </div>
                        </div>

                        {/* Quốc tịch */}
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <GlobeAltIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Quốc tịch</p>
                                <p className="text-gray-900 font-medium">{user.nationality || 'Chưa cập nhật'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin tài khoản */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Ngày tạo tài khoản</p>
                                <p className="text-gray-900 font-medium">{formatDate(user.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                                <p className="text-gray-900 font-medium">{formatDate(user.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default UserInfoModal; 