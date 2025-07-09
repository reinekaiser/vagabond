import React, { useState } from 'react'
import { Select, Pagination } from "antd";
import dayjs from 'dayjs';
import { Box, CircularProgress } from '@mui/material';
import { DownOutlined } from '@ant-design/icons';
import { useGetTourBookingsQuery, useUpdateTourBookingStatusMutation } from '../../redux/api/tourBookingApiSlice';
const { Option } = Select;

const statusOptions = [
    { value: 'pending', label: 'Pending', textColor: 'text-orange-600', bgColor: 'bg-orange-50', iconColor: '#ea580c' },
    { value: 'confirmed', label: 'Confirmed', textColor: 'text-green-600', bgColor: 'bg-green-100', iconColor: '#059669' },
    { value: 'cancelled', label: 'Cancelled', textColor: 'text-red-600', bgColor: 'bg-red-200', iconColor: '#dc2626' },
];


const TourBooking = () => {
    const [bookingStatus, setBookingStatus] = useState('all');
    const [page, setPage] = useState(1);

    const { data: tourBookings, isLoading, refetch } = useGetTourBookingsQuery({
        bookingStatus,
        page,
    })
    const [updateStatus] = useUpdateTourBookingStatusMutation();

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

    console.log("Tour bookings data:", tourBookings);

    return (
        <div className='bg-softBlue min-h-screen p-4 md:p-8'>
            <p className='font-semibold text-[20px] my-6'>Danh sách đơn đặt tour</p>
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
                <div>
                    <div className='grid grid-cols-9 gap-3 bg-slate-100 pl-11 py-4'>
                        <div className='col-span-2 font-semibold'>Tour</div>
                        <div className='col-span-2 font-semibold'>Loại vé</div>
                        <div className='col-span-1 font-semibold'>Người đặt</div>
                        <div className='col-span-1 font-semibold'>Ngày sử dụng</div>
                        <div className='col-span-1 font-semibold'>Tổng tiền</div>
                        <div className='col-span-2 font-semibold'>Trạng thái</div>
                    </div>
                    {tourBookings?.bookings?.length > 0 ? (
                        tourBookings?.bookings?.map((booking) => (
                            <div key={booking._id} className='grid grid-cols-9 gap-3 pl-11 py-4 border-b text-[14px] hover:bg-slate-50 duration-300'>
                                <div className='col-span-2'>
                                    {booking.tourId?.name?.length > 50 ? booking.tourId.name.slice(0, 50) + '...'
                                        : booking.tourId?.name}
                                </div>
                                <div className='col-span-2'>
                                    {booking.ticketId?.title?.length > 55 ? booking.ticketId.title.slice(0, 55) + '...'
                                        : booking.ticketId?.title}
                                </div>
                                <div className='col-span-1'>{booking.userId?.firstName} {booking.userId?.lastName}</div>
                                <div className='col-span-1'>{dayjs(booking.useDate).format('DD/MM/YYYY')}</div>
                                <div className='col-span-1'>{booking.totalPrice.toLocaleString('vi-VN')} ₫</div>
                                <div className='col-span-2'>
                                    <BookingStatusSelect booking={booking} handleUpdateBookingStatus={handleUpdateBookingStatus} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className='text-center text-gray-500 py-4'>Không có đơn đặt nào</p>
                    )}
                    <div className='px-6 pb-4'>
                        <Pagination
                            total={tourBookings?.total}
                            align='end'
                            style={{
                                marginTop: "20px",
                            }}
                            pageSize={tourBookings?.limit}
                            current={page}
                            onChange={handleChangePage}
                        />
                    </div>
                </div>
            </div>
        </div>
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

export default TourBooking