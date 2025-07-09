import React, { useState } from 'react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import BookingsModal from './BookingsModal';

const TopProducts = ({ tours, hotels }) => {
    const [bookingsModalVisible, setBookingsModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getImageUrl = (images) => {
        if (Array.isArray(images) && images.length > 0) {
            return images[0];
        }
        return null; // Return null instead of placeholder URL
    };

    const handleViewProduct = (product) => {
        setSelectedProduct({
            id: product.id,
            type: product.type,
            name: product.name
        });
        setBookingsModalVisible(true);
    };

    const handleCloseBookingsModal = () => {
        setBookingsModalVisible(false);
        setSelectedProduct(null);
    };

    // Check if product has real ID (not fake fallback data)
    const isRealProduct = (product) => {
        return product.id && !product.id.includes('fake') && product.id.length > 10;
    };

    // Combine tours and hotels for top products
    const combinedProducts = [
        ...tours.map(tour => ({
            name: tour.name,
            id: tour._id,
            sales: `${tour.totalBookings || tour.bookings || 0} Bookings`,
            image: getImageUrl(tour.images),
            bgColor: 'bg-green-50',
            revenue: tour.totalRevenue ? formatCurrency(tour.totalRevenue) : null,
            type: 'tour'
        })),
        ...hotels.map(hotel => ({
            name: hotel.name,
            id: hotel._id,
            sales: `${hotel.totalBookings} Bookings`,
            image: getImageUrl(hotel.img),
            bgColor: 'bg-blue-50',
            revenue: formatCurrency(hotel.totalRevenue),
            type: 'hotel'
        }))
    ].slice(0, 3);

    // Fallback data when no real data available
    const topProducts = [
        {
            name: "Địa dao Cù Chi - Tour ngầm",
            id: "1f7053",
            sales: "7 Bookings",
            bgColor: "bg-green-50",
            type: "tour"
        },
        {
            name: "Tour vịnh Hạ Long trên thuyền",
            id: "75f1ae",
            sales: "1 Bookings",
            bgColor: "bg-green-50",
            type: "tour"
        },
        {
            name: "Khách sạn Palace Saigon",
            id: "e4d0cc",
            sales: "1 Bookings",
            bgColor: "bg-blue-50",
            type: "hotel"
        }
    ];

    const renderProductImage = (product) => {
        if (product.image) {
            return (
                <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-8 h-8 object-cover rounded"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            );
        }
        
        // Fallback to colored div with first letter
        const firstLetter = product.name.charAt(0).toUpperCase();
        return (
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-600 text-xs font-semibold">{firstLetter}</span>
            </div>
        );
    };

    return (
        <>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Sản Phẩm Bán Chạy Nhất</h3>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                        <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                <div className="space-y-4">
                    {combinedProducts.length > 0 ? (
                        combinedProducts.map((product, index) => (
                            <div key={product.id} className="flex items-center space-x-4 p-1 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className={`w-12 h-12 rounded-lg ${product.bgColor} flex items-center justify-center flex-shrink-0`}>
                                    {renderProductImage(product)}
                                    <div className="w-8 h-8 bg-gray-200 rounded hidden items-center justify-center">
                                        <span className="text-gray-600 text-xs font-semibold">
                                            {product.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {product.name}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        ID: {product.id.slice(-6)}
                                    </p>
                                </div>
                                
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{product.sales}</p>
                                    {product.revenue && (
                                        <p className="text-xs text-gray-500">{product.revenue}</p>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={() => handleViewProduct(product)}
                                    disabled={!isRealProduct(product)}
                                    className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                        isRealProduct(product) 
                                            ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' 
                                            : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                    title={!isRealProduct(product) ? 'Dữ liệu mẫu - không thể xem booking' : 'Xem danh sách booking'}
                                >
                                    {isRealProduct(product) ? 'Xem' : 'Demo'}
                                </button>
                            </div>
                        ))
                    ) : (
                        // Fallback data when no real data available
                        topProducts.map((product, index) => (
                            <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className={`w-12 h-12 rounded-lg ${product.bgColor} flex items-center justify-center flex-shrink-0`}>
                                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                                        <span className="text-gray-600 text-xs font-semibold">
                                            {product.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                        {product.name}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        ID: {product.id}
                                    </p>
                                </div>
                                
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{product.sales}</p>
                                </div>
                                
                                <button 
                                    onClick={() => handleViewProduct(product)}
                                    disabled={!isRealProduct(product)}
                                    className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                                        isRealProduct(product) 
                                            ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50' 
                                            : 'text-gray-400 cursor-not-allowed'
                                    }`}
                                    title={!isRealProduct(product) ? 'Dữ liệu mẫu - không thể xem booking' : 'Xem danh sách booking'}
                                >
                                    {isRealProduct(product) ? 'Xem' : 'Demo'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <BookingsModal
                visible={bookingsModalVisible}
                onCancel={handleCloseBookingsModal}
                productId={selectedProduct?.id}
                productType={selectedProduct?.type}
                productName={selectedProduct?.name}
            />
        </>
    );
};

export default TopProducts; 