import React, { useState } from 'react'
import { useGetHotelBookingsQuery, useUpdateHotelBookingStatusMutation } from '../../redux/api/hotelBookingApiSlice'
import { Select, Pagination } from "antd";
import dayjs from 'dayjs';
import { Box, CircularProgress } from '@mui/material';
import { DownOutlined } from '@ant-design/icons';
const { Option } = Select;


const statusOptions = [
    { value: 'pending', label: 'Pending', textColor: 'text-orange-600', bgColor: 'bg-orange-50', iconColor: '#ea580c' },
    { value: 'confirmed', label: 'Confirmed', textColor: 'text-green-600', bgColor: 'bg-green-100', iconColor: '#059669' },
    { value: 'cancelled', label: 'Cancelled', textColor: 'text-red-600', bgColor: 'bg-red-200', iconColor: '#dc2626' },
];


const HotelBooking = () => {
    const [bookingStatus, setBookingStatus] = useState('all');
    const [page, setPage] = useState(1);

    const { data: hotelBokings, isLoading, refetch } = useGetHotelBookingsQuery({
        bookingStatus,
        page,
    });
    const [updateStatus] = useUpdateHotelBookingStatusMutation();

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const handleUpdateBookingStatus = async (id, bookingStatus) => {
        // console.log("Updating booking status for ID:", id, "to", bookingStatus);
        try {
            const res = await updateStatus({ id, bookingStatus }).unwrap();
            console.log("Booking status updated successfully", res);
            refetch();
        } catch (error) {
            console.error("Failed to update booking status:", error);
        }
    }

    if ((isLoading)) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    console.log("hotelBokings", hotelBokings);

    return (
        <div className='bg-softBlue min-h-screen p-4 md:p-8'>
            <p className='font-semibold text-[20px] my-6'>Danh sách đơn đặt khách sạn</p>
            <div className='container mx-auto bg-white rounded-lg shadow-lg'>
                <div className='flex justify-start items-center mb-3 pl-6 pt-4'>
                    <div className='flex items-center pl-3 py-1 rounded-lg'>
                        <span className='text-[14px] font-medium'>Status: </span>
                        <Select
                            className='custom-select'
                            style={{ width: 150 }}
                            defaultValue="Tất cả"
                            optionLabelProp="label"
                            onChange={(value) => {
                                setBookingStatus(value);
                            }}
                        >
                            <Option value="all" label={<span style={{ fontWeight: "bold" }}>Tất cả</span>}>Tất cả</Option>
                            <Option value="pending" label={<span style={{ fontWeight: "bold" }}>Pending</span>}>Pending</Option>
                            <Option value="confirmed" label={<span style={{ fontWeight: "bold" }}>Confirmed</span>}>Confirmed</Option>
                            <Option value="cancelled" label={<span style={{ fontWeight: "bold" }}>Cancelled</span>}>Cancelled</Option>
                        </Select>
                    </div>
                </div>
                <div className=''>
                    <div className='grid grid-cols-10 gap-2 bg-slate-100 pl-11 py-4'>
                        <div className='col-span-2 font-semibold'>Khách sạn</div>
                        <div className='col-span-2 font-semibold'>Loại phòng</div>
                        <div className='col-span-1 font-semibold'>Người đặt</div>
                        <div className='col-span-1 font-semibold'>Check in</div>
                        <div className='col-span-1 font-semibold'>Check out</div>
                        <div className='col-span-1 font-semibold'>Tổng tiền</div>
                        <div className='col-span-2 font-semibold'>Trạng thái</div>
                    </div>
                    {hotelBokings?.bookings?.length > 0 ? (
                        hotelBokings.bookings.map((booking) => (
                            <div key={booking._id} className='grid grid-cols-10 gap-2 border-b pl-11 py-4 text-[14px] hover:bg-slate-50 duration-300'>
                                <div className='col-span-2'>{booking.hotelId.name}</div>
                                <div className='col-span-2'>{booking.roomTypeId.name}</div>
                                <div className='col-span-1'>{booking.userId.firstName} {booking.userId.lastName}</div>
                                <div className='col-span-1'>{dayjs(booking.checkin).format('DD/MM/YYYY')}</div>
                                <div className='col-span-1'>{dayjs(booking.checkout).format('DD/MM/YYYY')}</div>
                                <div className='col-span-1'>{booking.totalPrice.toLocaleString()} ₫</div>
                                <div className='col-span-2'>
                                    <BookingStatusSelect
                                        booking={booking}
                                        handleUpdateBookingStatus={handleUpdateBookingStatus}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className='text-center col-span-10'>Không có đơn đặt nào.</p>
                    )}
                    <div className='px-6 pb-4'>
                        <Pagination
                            total={hotelBokings?.total}
                            align='end'
                            style={{
                                marginTop: "20px",
                            }}
                            pageSize={hotelBokings?.pageSize}
                            current={page}
                            onChange={handleChangePage}
                        />
                    </div>
                </div>
            </div>
        </div >
    )
}

function BookingStatusSelect({ booking, handleUpdateBookingStatus }) {
    const currentIndex = statusOptions.findIndex(opt => opt.value === booking.bookingStatus);

    return (
        <Select
            value={booking.bookingStatus}
            onChange={(value) => handleUpdateBookingStatus(booking._id, value)}
            size="small"
            className={`px-2 py-1 rounded-md text-[12px] font-semibold border-none ${currentIndex !== -1 ? statusOptions[currentIndex].bgColor : 'bg-orange-50'
                }`}
            variant="unstyled"
            optionLabelProp="label"
            suffixIcon={
                <DownOutlined
                    style={{
                        fontSize: '10px',
                        color: currentIndex !== -1 ? statusOptions[currentIndex].iconColor : '#ea580c',
                    }}
                />
            }
            style={{ width: 130 }}
        >
            {statusOptions
                .filter((_, idx) => idx >= currentIndex) // chỉ lấy từ trạng thái hiện tại trở xuống
                .map(({ value, label, textColor }) => (
                    <Option
                        key={value}
                        value={value}
                        label={<span className={`${textColor} font-semibold text-[12px]`}>{label}</span>}
                    >
                        {label}
                    </Option>
                ))}
        </Select>
    );
}


export default HotelBooking