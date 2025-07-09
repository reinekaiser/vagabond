import React from 'react';
import { 
    CurrencyDollarIcon, 
    UsersIcon, 
    TicketIcon,
    BuildingOfficeIcon,
    ArrowUpIcon,
    ArrowDownIcon 
} from '@heroicons/react/24/outline';

const StatsCards = ({ stats }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const formatPercentage = (value) => {
        return `${value.toFixed(2)}%`;
    };

    const cards = [
        {
            title: 'Tổng Doanh Thu',
            value: formatCurrency(stats.totalRevenue),
            icon: CurrencyDollarIcon,
            change: '+14.9%',
            changeAmount: `(+${formatCurrency(stats.totalRevenue * 0.149)})`,
            isPositive: true,
            bgColor: 'bg-orange-50',
            iconColor: 'text-orange-600'
        },
        {
            title: 'Khách Hàng Mới',
            value: stats.newUsersCount.toString(),
            icon: UsersIcon,
            change: '-8.6%',
            changeAmount: `(-${Math.floor(stats.newUsersCount * 0.086)})`,
            isPositive: false,
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600'
        },
        {
            title: 'Booking Tour',
            value: `${stats.tourBookingsCount || 0}`,
            icon: TicketIcon,
            change: '+25.4%',
            changeAmount: `(+${Math.floor((stats.tourBookingsCount || 0) * 0.254)})`,
            isPositive: true,
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Booking Khách Sạn',
            value: `${stats.hotelBookingsCount}`,
            icon: BuildingOfficeIcon,
            change: '+35.2%',
            changeAmount: `(+${Math.floor(stats.hotelBookingsCount * 0.352)})`,
            isPositive: true,
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
        },
        {
            title: 'Tổng Người Dùng',
            value: formatNumber(stats.totalUsers),
            icon: UsersIcon,
            change: '+12.5%',
            changeAmount: `(+${Math.floor(stats.totalUsers * 0.125)})`,
            isPositive: true,
            bgColor: 'bg-pink-50',
            iconColor: 'text-pink-600'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {cards.map((card, index) => (
                <div key={index} className={`${card.bgColor} rounded-2xl p-6 border border-gray-100`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${card.bgColor}`}>
                            <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                        <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        
                        <div className="flex items-center space-x-2">
                            <span className={`flex items-center text-sm font-medium ${
                                card.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {card.isPositive ? (
                                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                                ) : (
                                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                                )}
                                {card.change}
                            </span>
                            {card.changeAmount && (
                                <span className="text-sm text-gray-500">{card.changeAmount}</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards; 