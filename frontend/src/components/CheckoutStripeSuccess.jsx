import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLazyGetStripeBookingStatusQuery } from "../redux/api/tourBookingApiSlice";
import { BsCheckCircle } from "react-icons/bs";
import dayjs from 'dayjs';
const CheckoutStripeSuccess = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");

    const [booking, setBooking] = useState(null);
    const [bookingStatus, setBookingStatus] = useState("pending");
    const [trigger, { data, error, isFetching }] =
        useLazyGetStripeBookingStatusQuery();
    useEffect(() => {
        if (!sessionId) return;
        let retries = 0;

        const checkStatus = async () => {
            while (retries < 5) {
                const res = await trigger(sessionId)
                    .unwrap()
                    .catch(() => null);
                if (res.status === "success") {
                    setBookingStatus("success");
                    console.log(res.booking);
                    setBooking(res.booking);
                    return;
                }
                if (res.status === "error") {
                    setBookingStatus("error");
                    return;
                }
                if (res.status === "not_found") {
                    retries++;
                    await new Promise((r) => setTimeout(r, 2000));
                    continue;
                }
            }
            setBookingStatus("error");
        };
        checkStatus();
    }, []);

    return (
        <div className="p-4 text-center">
            {bookingStatus === "pending" && (
                <p>Đang kiểm tra trạng thái đơn hàng...</p>
            )}
            {bookingStatus === "not found" && (
                <p>Đơn hàng chưa được xử lý. Vui lòng đợi 1-2 phút.</p>
            )}
            {bookingStatus === "error" && (
                <p>Có lỗi xảy ra khi kiểm tra đơn hàng.</p>
            )}
            {bookingStatus === "success" && (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="max-w-[440px] m-auto p-6 bg-white shadow-lg rounded-lg border">
                        <div className="flex flex-col items-center text-center">
                            <BsCheckCircle className="text-green-500 w-[50px] h-[50px]" />
                            <h2 className="text-2xl font-bold ">
                                Thanh toán thành công
                            </h2>
                            <p className="text-gray-600 mt-2 font-semibold">
                                Cảm ơn bạn đã đặt chỗ. Đặt chỗ của bạn đang được
                                xử lý
                            </p>
                        </div>

                        <hr className="my-6" />

                        <div className="space-y-3 text-base text-gray-700">
                            <div className="flex justify-between">
                                <span className="font-medium">
                                    Số tiền thanh toán:
                                </span>
                                <span className="font-semibold text-orange_primary">
                                    {booking.totalPrice.toLocaleString("vi-VN")}{" "}
                                    VND
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">
                                    Phương thức thanh toán:
                                </span>
                                <span className="font-semibold">
                                    {booking.paymentMethod
                                        .charAt(0)
                                        .toUpperCase() +
                                        booking.paymentMethod.slice(1)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">
                                    Ngày thanh toán:
                                </span>
                                <span className="font-semibold">
                                    {dayjs(booking.createdAt)
                                        .locale("vi")
                                        .format("D [thg] M, YYYY [lúc] HH:mm")}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <Link
                                to={"/"}
                                className="bg-primary text-white px-4 py-2 rounded hover:opacity-80 op transition"
                            >
                                Tiếp tục trải nghiệm
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutStripeSuccess;
