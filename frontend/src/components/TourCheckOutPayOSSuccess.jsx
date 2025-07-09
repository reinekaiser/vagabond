import React, { useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom";
import { useSaveTourBookingMutation } from '../redux/api/tourBookingApiSlice';
import { BsCheckCircle } from 'react-icons/bs';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { Link } from 'react-router-dom';

const TourCheckOutPayOSSuccess = () => {
    const [searchParams] = useSearchParams();
    const orderCode = searchParams.get("orderCode");
    const storedData = localStorage.getItem("pendingTourBooking")
    const bookingData = storedData ? JSON.parse(storedData) : null;

    const [saveTourBooking, { isLoading, isSuccess, isError, error }] = useSaveTourBookingMutation();
    const [hasCalled, setHasCalled] = useState(false);

    useEffect(() => {
        if (!hasCalled && orderCode && bookingData) {
            saveTourBooking({ orderCode, bookingData });
            setHasCalled(true);
        }
    }, [orderCode, bookingData, saveTourBooking, hasCalled]);

    if (isLoading)
        return (
            <div className="flex items-center justify-center py-10 text-gray-600">
                <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span>Đang xử lý...</span>
            </div>
        );

    if (isError) return <div className="text-red-500">Có lỗi xảy ra: {error?.data?.error || "Lưu thất bại"}</div>;

    if (isSuccess) {

        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="max-w-[440px] m-auto p-6 bg-white shadow-lg rounded-lg border">
                    <div className="flex flex-col items-center text-center">
                        <BsCheckCircle className="text-green-500 w-[50px] h-[50px]" />
                        <h2 className="text-2xl font-bold">Thanh toán thành công</h2>
                        <p className="text-gray-600 mt-2 font-semibold">
                            Cảm ơn bạn đã đặt chỗ. Đặt chỗ của bạn đang được xử lý
                        </p>
                    </div>

                    <hr className="my-6" />

                    <div className="space-y-3 text-base text-gray-700">
                        <div className="flex justify-between">
                            <span className="font-medium">Số tiền thanh toán:</span>
                            <span className="font-semibold text-orange_primary">{bookingData.totalPrice.toLocaleString("vi-VN")} VND</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Phương thức thanh toán:</span>
                            <span className="font-semibold">
                                {bookingData.paymentMethod.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Link to="/" className="bg-primary text-white px-4 py-2 rounded hover:opacity-80 transition">
                            Tiếp tục trải nghiệm
                        </Link>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="flex items-center justify-center py-10 text-gray-600">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span>Đang xử lý...</span>
        </div>
    )
}

export default TourCheckOutPayOSSuccess