import React, { useState, useEffect } from 'react';
import dashboardService from '../../services/dashboardService';
import StatsCards from '../../components/Dashboard/StatsCards';
import RevenueChart from '../../components/Dashboard/RevenueChart';
import TopProducts from '../../components/Dashboard/TopProducts';
import RecentBookings from '../../components/Dashboard/RecentBookings';
import TopCustomers from '../../components/Dashboard/TopCustomers';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [topTours, setTopTours] = useState([]);
    const [topHotels, setTopHotels] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
    const [topCustomers, setTopCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7');

    useEffect(() => {
        fetchDashboardData();
    }, [period]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [
                statsData,
                chartData,
                toursData,
                hotelsData,
                bookingsData,
                customersData
            ] = await Promise.all([
                dashboardService.getDashboardStats(period),
                dashboardService.getRevenueChart(period),
                dashboardService.getTopTours(3),
                dashboardService.getTopHotels(3),
                dashboardService.getRecentBookings(5),
                dashboardService.getTopCustomers(3)
            ]);

            setStats(statsData);
            setChartData(chartData);
            setTopTours(toursData);
            setTopHotels(hotelsData);
            setRecentBookings(bookingsData);
            setTopCustomers(customersData);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const periodOptions = [
        { value: '7', label: '7 ngày qua' },
        { value: '30', label: '30 ngày qua' },
        { value: '365', label: 'Năm qua' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Chào mừng trở lại, Admin!</h1>
                    <p className="text-gray-600 mt-1">Đây là thông tin hoạt động của hệ thống hôm nay</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {periodOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    
                    
                </div>
            </div>

            {/* Stats Cards */}
            {stats && <StatsCards stats={stats} />}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Revenue Chart - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <RevenueChart data={chartData} period={period} />
                </div>

                {/* Top Products */}
                <div className="lg:col-span-1">
                    <TopProducts tours={topTours} hotels={topHotels} />
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Recent Bookings - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <RecentBookings bookings={recentBookings} />
                </div>

                {/* Top Customers */}
                <div className="lg:col-span-1">
                    <TopCustomers customers={topCustomers} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 