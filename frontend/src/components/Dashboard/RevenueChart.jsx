import React from 'react';
import Chart from 'react-apexcharts';

const RevenueChart = ({ data, period }) => {
    // Chuẩn bị dữ liệu cho biểu đồ
    const chartData = {
        series: [
            {
                name: 'Doanh Thu Tour',
                type: 'area',
                data: data.map(item => ({
                    x: item.date,
                    y: item.tourRevenue || 0
                }))
            },
            {
                name: 'Doanh Thu Khách Sạn',
                type: 'area',
                data: data.map(item => ({
                    x: item.date,
                    y: item.hotelRevenue || 0
                }))
            }
        ],
        options: {
            chart: {
                height: 350,
                type: 'area',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            colors: ['#F59E0B', '#10B981'],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: [2, 2]
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.1,
                    stops: [0, 90, 100]
                }
            },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'left'
            },
            xaxis: {
                type: 'datetime',
                categories: data.map(item => item.date),
                labels: {
                    style: {
                        colors: '#64748B',
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'Doanh Thu (VND)',
                    style: {
                        color: '#64748B'
                    }
                },
                labels: {
                    style: {
                        colors: '#64748B'
                    },
                    formatter: function (val) {
                        if (val >= 1000000) {
                            return `₫${(val / 1000000).toFixed(1)}M`;
                        } else if (val >= 1000) {
                            return `₫${(val / 1000).toFixed(1)}K`;
                        }
                        return `₫${val}`;
                    }
                }
            },
            grid: {
                borderColor: '#E2E8F0',
                strokeDashArray: 4
            },
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function (val) {
                        return new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        }).format(val);
                    }
                }
            }
        }
    };

    const getPeriodLabel = () => {
        switch (period) {
            case '7': return '7 ngày qua';
            case '30': return '30 ngày qua';
            case '365': return 'Năm qua';
            default: return '7 ngày qua';
        }
    };

    // Tính toán thống kê từ dữ liệu thực tế
    const totalTourBookings = data.reduce((sum, item) => sum + (item.tourBookings || 0), 0);
    const totalHotelBookings = data.reduce((sum, item) => sum + (item.hotelBookings || 0), 0);
    const totalTourRevenue = data.reduce((sum, item) => sum + (item.tourRevenue || 0), 0);
    const totalHotelRevenue = data.reduce((sum, item) => sum + (item.hotelRevenue || 0), 0);
    const totalRevenue = totalTourRevenue + totalHotelRevenue;
    
    const formatCurrency = (amount) => {
        if (amount >= 1000000) {
            return `₫${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `₫${(amount / 1000).toFixed(1)}K`;
        }
        return `₫${amount}`;
    };

    const formatNumber = (num) => {
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Tổng Quan</h3>
                    <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Doanh Thu Tour</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-600">Doanh Thu Khách Sạn</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600">
                        <option value={period}>{getPeriodLabel()}</option>
                    </select>
                </div>
            </div>

            <div className="mb-6">
                <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalTourRevenue)}</div>
                        <div className="text-sm text-gray-500">Doanh thu Tour</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalHotelRevenue)}</div>
                        <div className="text-sm text-gray-500">Doanh thu Hotel</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
                        <div className="text-sm text-gray-500">Tổng doanh thu</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{formatNumber(totalTourBookings + totalHotelBookings)}</div>
                        <div className="text-sm text-gray-500">Tổng Booking</div>
                    </div>
                </div>
            </div>

            <Chart 
                options={chartData.options} 
                series={chartData.series} 
                type="area" 
                height={350} 
            />
        </div>
    );
};

export default RevenueChart; 