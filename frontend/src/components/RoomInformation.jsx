import React, { useState, useRef } from 'react'
import { FaAngleRight } from "react-icons/fa6";
import { TbCoffeeOff } from "react-icons/tb";
import { TbCoffee } from "react-icons/tb";
import { MdOutlineCheckCircle } from "react-icons/md";
import { MdOutlineDoNotDisturbOn } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { Modal } from "antd";
import { BiArea } from "react-icons/bi";
import { PiMountainsDuotone } from "react-icons/pi";
import { IoBedOutline } from "react-icons/io5";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FaCircleCheck } from "react-icons/fa6";
import { LuCircleDollarSign } from "react-icons/lu";
import { CLOUDINARY_BASE_URL } from '../constants/hotel';

const RoomInformation = ({ roomType, room, review, handleBookingRoom }) => {
    const [visibleModal, setVisibleModal] = useState(false);
    const showModal = () => {
        setVisibleModal(true);
    };
    const closeModal = () => {
        setVisibleModal(false);
    }

    const freeCancelDate = new Date(room.checkin);
    freeCancelDate.setDate(freeCancelDate.getDate() - Number(room.cancellationPolicy.day));

    const infoRef = useRef(null);
    const priceRef = useRef(null);
    const policyRef = useRef(null);

    const scrollToRef = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div>
            <div className='grid grid-cols-[70%_30%] items-end hover:shadow-lg transition duration-300'
                onClick={showModal}
            >
                <div className='bg-white py-4 px-4 h-full'>
                    <p className='text-[16px] font-semibold flex items-center mb-3'>
                        {room.bedType}
                        <FaAngleRight className='mx-1' />
                    </p>

                    {room.serveBreakfast == "Bao gồm bữa sáng" ? (
                        <p className='text-[14px] flex items-center text-[#00828A] mb-2'>
                            <TbCoffee className='text-[18px] mr-2' />
                            {room.serveBreakfast}
                        </p>
                    ) : (
                        <p className='text-[14px] flex items-center text-gray-600 mb-2'>
                            <TbCoffeeOff className='text-[18px] mr-2' />
                            {room.serveBreakfast}
                        </p>
                    )}

                    {room.cancellationPolicy.refund == "Không hoàn tiền" ? (
                        <p className='text-[14px] flex items-center text-gray-600 mb-2'>
                            <MdOutlineDoNotDisturbOn className='text-[18px] mr-2' />
                            {room.cancellationPolicy.refund}
                        </p>
                    ) : (
                        <p className='text-[14px] flex items-center text-[#00828A] mb-2'>
                            <MdOutlineCheckCircle className='text-[18px] mr-2' />
                            {room.cancellationPolicy.refund}
                        </p>
                    )}
                </div>

                <div className='ml-1 bg-white h-full flex flex-col justify-end items-end p-4'>
                    <div className='text-[18px] font-medium text-orange-500'>Giá phòng</div>
                    <div className="flex justify-end mb-3">
                        <p className="text-[20px] font-semibold border-b border-dashed border-black inline-block">
                            {Number(room.price).toLocaleString("vi-VN")} ₫
                        </p>
                    </div>

                    {review != 1 && (
                        <div>
                            <div className='flex justify-end'>
                                <button
                                    className='py-2 px-7 bg-orange-500 text-white rounded-lg'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBookingRoom(roomType._id, room._id);
                                    }}
                                >
                                    Đặt
                                </button>
                            </div>
                            {room.numRoomsAvailable && (
                                <p className='text-red-600 text-[14px] font-light mt-3'>
                                    Chỉ còn {room.numRoomsAvailable} phòng!
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                open={visibleModal}
                onCancel={closeModal}
                footer={null}
                closable={false}
                title={null}
                style={{ top: 0 }}
                width={600}
                className="custom-right-modal"
            >
                <div className="bg-white sticky top-0 z-10">
                    <div className='flex justify-end px-5 pt-5'>
                        <button onClick={closeModal} className="text-xl font-bold">
                            <IoMdClose className='text-[24px]' />
                        </button>
                    </div>
                    <div className="flex gap-5 py-3 border-b shadow pl-7">
                        <button onClick={() => scrollToRef(infoRef)} className='hover:text-orange-500'>Thông tin phòng</button>
                        <button onClick={() => scrollToRef(priceRef)} className='hover:text-orange-500'>Giá chi tiết</button>
                        <button onClick={() => scrollToRef(policyRef)} className='hover:text-orange-500'>Chính sách chỗ lưu trú</button>
                    </div>
                </div>

                <div className=''>
                    <div ref={infoRef} className='px-7 py-5 bg-white'>
                        <div className="overflow-hidden rounded-xl h-[280px] mb-4">
                            <img
                                src={`${CLOUDINARY_BASE_URL}/${roomType.img[0]}`}
                                alt="only"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-2 h-7 bg-orange-500 rounded"></div>
                            <h2 className="text-[20px] font-semibold">{roomType.name}</h2>
                        </div>
                        {roomType.area && (
                            <p className='flex items-center text-sm mt-3 ml-3'>
                                <BiArea className='text-lg mr-1' />
                                {roomType.area} m²
                            </p>
                        )}
                        {roomType.view && (
                            <p className='flex items-center text-sm mt-2 ml-3'>
                                <PiMountainsDuotone className='text-lg mr-1' />
                                {roomType.view}
                            </p>
                        )}

                        <div className='border-b my-5'></div>

                        {room.serveBreakfast == "Bao gồm bữa sáng" ? (
                            <p className='text-[14px] flex items-center text-[#00828A] mb-2 ml-3'>
                                <TbCoffee className='text-[18px] mr-2' />
                                {room.serveBreakfast}
                            </p>
                        ) : (
                            <p className='text-[14px] flex items-center text-gray-600 mb-2 ml-3'>
                                <TbCoffeeOff className='text-[18px] mr-2' />
                                {room.serveBreakfast}
                            </p>
                        )}

                        <p className='text-[14px] flex items-center text-gray-600 mb-2 ml-3'>
                            <IoBedOutline className='text-[18px] mr-2' />
                            {room.bedType}
                        </p>

                        <p className='text-[14px] flex items-center text-gray-600 mb-2 ml-3'>
                            <MdOutlinePeopleAlt className='text-[18px] mr-2' />
                            Phòng dành cho {room.maxOfGuest} người lớn. Lựa chọn phù hợp với tổng số khách lưu trú.
                        </p>

                        <h3 className='ml-3 my-3 font-bold text-[18px]'>Tiện ích Phòng</h3>
                        {roomType.roomFacilities.map((item, index) => (
                            <p key={index} className='flex items-center text-gray-600 text-[16px] ml-3 mb-1'>
                                <IoMdCheckmarkCircleOutline className='text-[18px] mr-2' />
                                {item}
                            </p>
                        ))}
                    </div>

                    <div ref={priceRef} className='mt-2 bg-white px-7 py-5'>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-2 h-7 bg-orange-500 rounded"></div>
                            <h2 className="text-[20px] font-semibold">Giá chi tiết</h2>
                        </div>
                        <div>
                            {review == 1 ? (
                                <div className="flex justify-end">
                                    <div className="text-[18px] font-semibold inline-block">
                                        {Number(room.price).toLocaleString("vi-VN")} ₫
                                        <p className='text-[12px] font-normal text-gray-400'>Giá mỗi phòng/đêm</p>
                                    </div>
                                </div>

                            ) : (
                                <div className="flex items-start">
                                    <p className="text-[16px] font-semibold flex-1">
                                        {room.totalRooms} phòng x {room.totalNights} đêm
                                    </p>
                                    <div className="ml-auto text-right">
                                        <div className="text-[20px] font-semibold flex items-end justify-end mb-2">
                                            <p className="text-[12px] font-normal text-gray-400 mr-1">Tổng</p>
                                            {Number(room.totalPrice).toLocaleString("vi-VN")} ₫
                                        </div>
                                        <div className="text-[14px] font-normal flex items-end justify-end">
                                            <p className="text-[12px] font-normal text-gray-400 mr-1">Mỗi phòng/đêm</p>
                                            {Number(room.price * 1).toLocaleString("vi-VN")} ₫
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div ref={policyRef} className='mt-2 bg-white px-7 py-5 text-[16px]'>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-2 h-7 bg-orange-500 rounded"></div>
                            <h2 className="text-[20px] font-semibold">Chính sách chỗ lưu trú</h2>
                        </div>
                        <div className='mb-3'>
                            <p className='font-semibold'>Xác nhận tức thời</p>
                            <p>Nhận xác nhận đặt phòng chỉ trong vài phút</p>
                        </div>

                        <div>
                            {review != 1 ? (
                                room.cancellationPolicy.refund === "Không hoàn tiền" ? (
                                    <div className='mb-2'>
                                        <p className='font-semibold'>{room.cancellationPolicy.refund}</p>
                                        <p>Sau khi xác nhận, đơn hàng của bạn không thể huỷ hoặc sửa đổi</p>
                                    </div>
                                ) : room.cancellationPolicy.refund === "Hủy miễn phí" ? (
                                    <div className='mb-2'>
                                        <p className='font-semibold'>Miễn phí huỷ (Thời gian có hạn)</p>
                                        <p>Lưu ý: Phí hủy sẽ tùy thuộc vào số lượng phòng đã đặt. Tất cả thời gian được liệt kê đều tính theo giờ địa phương của khách sạn.</p>
                                        <div className='py-2 px-4 space-y-1 bg-blue-50 rounded-lg text-[16px] font-light'>
                                            <div className='flex items-center gap-1 mb-1'>
                                                <FaCircleCheck className="text-green-500" />
                                                <p className='font-semibold '>Huỷ miễn phí</p>
                                            </div>
                                            <p className='mx-4'>Hủy miễn phí đến <span className='font-medium'>{freeCancelDate.toLocaleDateString("vi-VN")}</span></p>
                                            <div className='flex items-center gap-2 mb-1'>
                                                <LuCircleDollarSign />
                                                <p className='font-semibold'>Sau thời hạn "Hủy miễn phí"</p>
                                            </div>
                                            <p className='mx-4'>
                                                Nếu huỷ sau <span className='font-medium'>{freeCancelDate.toLocaleDateString("vi-VN")}</span>
                                                sẽ tính phí 100% trên tổng giá
                                            </p>
                                            <p className='mx-4'>Việc hủy/thay đổi đặt chỗ sau thời gian nhận phòng hoặc không hoàn thành nhận phòng sẽ chịu phí phạt có thể lên đến 100% giá trị đặt phòng, theo quyết định của khách sạn</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='mb-2'>
                                        <p className='font-semibold'>Miễn phí huỷ (Thời gian có hạn)</p>
                                        <p>Lưu ý: Phí hủy sẽ tùy thuộc vào số lượng phòng đã đặt. Tất cả thời gian được liệt kê đều tính theo giờ địa phương của khách sạn.</p>
                                        <div className='py-2 px-4 space-y-1 bg-blue-50 rounded-lg text-[16px] font-light'>
                                            <div className='flex items-center gap-1 mb-1'>
                                                <LuCircleDollarSign />
                                                <p className='font-semibold'>Phí huỷ được áp dụng như sau:</p>
                                            </div>
                                            <p className='mx-4'>
                                                Nếu bạn hủy trước <span className='font-medium'>{freeCancelDate.toLocaleDateString("vi-VN")} </span>
                                                bạn sẽ phải trả phí hủy là <span className='font-medium'>
                                                    {Math.round(room.price * (room.cancellationPolicy.percentBeforeDay / 100)).toLocaleString("vi-VN")}₫
                                                </span>
                                            </p>
                                            <p className='mx-4'>
                                                Nếu bạn hủy sau <span className='font-medium'>{freeCancelDate.toLocaleDateString("vi-VN")} </span>
                                                bạn sẽ phải trả phí hủy là <span className='font-medium'>
                                                    {Math.round(room.price * (room.cancellationPolicy.percentAfterDay / 100)).toLocaleString("vi-VN")}₫
                                                </span>
                                            </p>
                                            <p className='mx-4'>Việc hủy/thay đổi đặt chỗ sau thời gian nhận phòng hoặc không hoàn thành nhận phòng sẽ chịu phí phạt có thể lên đến 100% giá trị đặt phòng, theo quyết định của khách sạn</p>
                                        </div>
                                    </div>
                                )
                            ) : (
                                room.cancellationPolicy.refund === "Không hoàn tiền" ? (
                                    <div className='mb-2'>
                                        <p className='font-semibold'>{room.cancellationPolicy.refund}</p>
                                        <p>Sau khi xác nhận, đơn hàng của bạn không thể huỷ hoặc sửa đổi</p>
                                    </div>
                                ) : room.cancellationPolicy.refund === "Hủy miễn phí" ? (
                                    <div className='mb-2'>
                                        <p className='font-semibold'>Miễn phí huỷ (Thời gian có hạn)</p>
                                        <p>Lưu ý: Phí hủy sẽ tùy thuộc vào số lượng phòng đã đặt. Tất cả thời gian được liệt kê đều tính theo giờ địa phương của khách sạn.</p>
                                        <div className='py-2 px-4 space-y-1 bg-blue-50 rounded-lg text-[16px] font-light'>
                                            <div className='flex items-center gap-1 mb-1'>
                                                <FaCircleCheck className="text-green-500" />
                                                <p className='font-semibold '>Huỷ miễn phí</p>
                                            </div>
                                            <p className='mx-4'>Hủy miễn phí trước <span className='font-medium'>{room.cancellationPolicy.day}</span> từ ngày đặt </p>
                                            <div className='flex items-center gap-2 mb-1'>
                                                <LuCircleDollarSign />
                                                <p className='font-semibold'>Sau thời hạn "Hủy miễn phí"</p>
                                            </div>
                                            <p className='mx-4'>
                                                Nếu huỷ sau ngày đặt sẽ tính phí  100% trên tổng giá
                                            </p>
                                            <p className='mx-4'>Việc hủy/thay đổi đặt chỗ sau thời gian nhận phòng hoặc không hoàn thành nhận phòng sẽ chịu phí phạt có thể lên đến 100% giá trị đặt phòng, theo quyết định của khách sạn</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='mb-2'>
                                        <p className='font-semibold'>Miễn phí huỷ (Thời gian có hạn)</p>
                                        <p>Lưu ý: Phí hủy sẽ tùy thuộc vào số lượng phòng đã đặt. Tất cả thời gian được liệt kê đều tính theo giờ địa phương của khách sạn.</p>
                                        <div className='py-2 px-4 space-y-1 bg-blue-50 rounded-lg text-[16px] font-light'>
                                            <div className='flex items-center gap-1 mb-1'>
                                                <LuCircleDollarSign />
                                                <p className='font-semibold'>Phí huỷ được áp dụng như sau:</p>
                                            </div>
                                            <p className='mx-4'>
                                                Nếu bạn hủy trước <span className='font-medium'> {room.cancellationPolicy.day} từ ngày đặt </span>
                                                bạn sẽ phải trả phí hủy là <span className='font-medium'>
                                                    {Math.round(room.price * (room.cancellationPolicy.percentBeforeDay / 100)).toLocaleString("vi-VN")}₫
                                                </span>
                                            </p>
                                            <p className='mx-4'>
                                                Nếu bạn hủy sau ngày đặt
                                                bạn sẽ phải trả phí hủy là <span className='font-medium'>
                                                    {Math.round(room.price * (room.cancellationPolicy.percentAfterDay / 100)).toLocaleString("vi-VN")}₫
                                                </span>
                                            </p>
                                            <p className='mx-4'>Việc hủy/thay đổi đặt chỗ sau thời gian nhận phòng hoặc không hoàn thành nhận phòng sẽ chịu phí phạt có thể lên đến 100% giá trị đặt phòng, theo quyết định của khách sạn</p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    {review != 1 && (
                        <div className='mt-2 sticky bottom-0 bg-white px-7 py-5 z-10"'>
                            <div className="flex items-center">
                                <p className="text-[20px] font-semibold inline-block">
                                    {Number(room.price).toLocaleString("vi-VN")} ₫ <span className='text-[12px] font-light text-gray-500'>Mỗi đêm</span>
                                </p>
                                <div className="text-[18px] font-semibold inline-block ml-auto">
                                    <button
                                        className='py-2 px-7 rounded-lg bg-orange-500 text-white'
                                        onClick={() => {
                                            handleBookingRoom(roomType._id, room._id);
                                        }}
                                    >
                                        Đặt
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Modal >
        </div >
    )
}

export default RoomInformation;