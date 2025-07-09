import ImageGalleryFromCloudinary from '../components/ImageGalleryFromCloudinary';
import { BiArea } from "react-icons/bi";
import { PiMountainsDuotone } from "react-icons/pi";
import React from 'react';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Tooltip } from 'antd';
import RoomInformation from './RoomInformation';

const RoomTypesInformation = ({ roomTypesData = [], review = 1,
    handleBookingRoom
}) => {

    const renderFacilities = (items, cols = 2) => (
        <div className={`grid grid-cols-${cols} gap-1`}>
            {items.map((item, index) => (
                <p key={index} className='flex items-center text-gray-600 text-[14px]'>
                    <IoMdCheckmarkCircleOutline className='text-[15px] mr-[2px]' />
                    {item}
                </p>
            ))}
        </div>
    );

    return (
        <div>
            {roomTypesData.length > 0 && (
                <div>
                    {roomTypesData.map((roomType, index) => {
                        const facilities = roomType.roomFacilities || [];
                        const showMore = facilities.length > 6;
                        const displayedFacilities = showMore ? facilities.slice(0, 6) : facilities;

                        const fullFacilitiesTooltip = (
                            <div className="w-[800px]">
                                <div className="grid grid-cols-4 gap-1 m-1">
                                    {facilities.map((item, idx) => (
                                        <p key={idx} className='flex items-center text-gray-600 text-[14px]'>
                                            <IoMdCheckmarkCircleOutline className='text-[15px] mr-[2px]' />
                                            {item}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        );

                        return (
                            <div key={index} className='bg-gray-100 px-4 py-3 rounded-sm mb-6 space-y-3'>
                                <p className='font-semibold text-lg'>{roomType.name}</p>
                                <div className='grid grid-cols-1 md:grid-cols-[25%_75%] gap-4'>
                                    <div>
                                        <ImageGalleryFromCloudinary
                                            existingImages={roomType.img}
                                            option={2}
                                        />
                                        {roomType.area && (
                                            <p className='flex items-center text-sm mt-3'>
                                                <BiArea className='text-lg mr-1' />
                                                {roomType.area} m²
                                            </p>
                                        )}
                                        {roomType.view && (
                                            <p className='flex items-center text-sm mt-2'>
                                                <PiMountainsDuotone className='text-lg mr-1' />
                                                {roomType.view}
                                            </p>
                                        )}
                                        <div className="mt-2">
                                            {renderFacilities(displayedFacilities)}
                                            {showMore && (
                                                <Tooltip
                                                    title={fullFacilitiesTooltip}
                                                    placement="bottom"
                                                    trigger="hover"
                                                    color='white'
                                                >
                                                    <p className="border-b border-dashed border-gray-600 text-gray-800 text-[14px] mt-1 cursor-pointer w-fit">
                                                        Xem thêm tiện ích
                                                    </p>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </div>

                                    <div className='mr-4'>
                                        {roomType.rooms.map((avaiRoom, idx) => (
                                            <div key={idx} className='mb-1'>
                                                <RoomInformation roomType={roomType} room={avaiRoom} review={review} handleBookingRoom={handleBookingRoom}/>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RoomTypesInformation;