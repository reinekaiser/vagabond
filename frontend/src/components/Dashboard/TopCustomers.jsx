import React, { useState } from 'react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import UserInfoModal from './UserInfoModal';

const TopCustomers = ({ customers }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const getAvatarColor = (index) => {
        const colors = [
            'bg-blue-500',
            'bg-green-500', 
            'bg-purple-500',
            'bg-orange-500',
            'bg-pink-500'
        ];
        return colors[index % colors.length];
    };

    const handleViewCustomer = (customer) => {
        // Only allow viewing real customers, not fake fallback data
        const isRealCustomer = customer.userId || (customer._id && !customer._id.includes('fake-id'));
        if (isRealCustomer) {
            setSelectedUserId(customer.userId || customer._id);
            setModalVisible(true);
        }
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedUserId(null);
    };

    // Check if customer has real ID (not fake fallback data)
    const isRealCustomer = (customer) => {
        return customer.userId || (customer._id && !customer._id.includes('fake-id'));
    };

    // Fallback data when no real customers available
    const fallbackCustomers = [
        {
            _id: '675bb6b5-fake-id-1',
            firstName: 'Marks',
            lastName: 'Hoverson',
            totalBookings: 25,
            totalSpent: 15000000,
            avatar: null
        },
        {
            _id: '675bb6b5-fake-id-2',
            firstName: 'Marks',
            lastName: 'Hoverson',
            totalBookings: 15,
            totalSpent: 12000000,
            avatar: null
        },
        {
            _id: '675bb6b5-fake-id-3',
            firstName: 'Jhony',
            lastName: 'Peters',
            totalBookings: 23,
            totalSpent: 18000000,
            avatar: null
        }
    ];

    const displayCustomers = customers.length > 0 ? customers : fallbackCustomers;

    return (
        <>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Khách Hàng Đầu Tuần</h3>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    {displayCustomers.map((customer, index) => (
                        <div key={customer._id || customer.userId || index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-full ${getAvatarColor(index)} flex items-center justify-center flex-shrink-0`}>
                                    {customer.avatar ? (
                                        <img 
                                            src={customer.avatar} 
                                            alt={`${customer.firstName} ${customer.lastName}`}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white text-sm font-semibold">
                                            {getInitials(customer.firstName, customer.lastName)}
                                        </span>
                                    )}
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">
                                        {customer.firstName} {customer.lastName}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        {customer.totalBookings} Đơn hàng
                                    </p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => handleViewCustomer(customer)}
                                disabled={!isRealCustomer(customer)}
                                className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                    isRealCustomer(customer) 
                                        ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' 
                                        : 'text-gray-400 cursor-not-allowed'
                                }`}
                                title={!isRealCustomer(customer) ? 'Dữ liệu mẫu - không thể xem chi tiết' : 'Xem thông tin chi tiết'}
                            >
                                {isRealCustomer(customer) ? 'Xem' : 'Demo'}
                            </button>
                        </div>
                    ))}
                </div>

                {displayCustomers.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">Chưa có dữ liệu khách hàng</p>
                    </div>
                )}
            </div>

            <UserInfoModal
                visible={modalVisible}
                onCancel={handleCloseModal}
                userId={selectedUserId}
            />
        </>
    );
};

export default TopCustomers; 