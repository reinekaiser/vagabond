import React, { useEffect, useState } from 'react'
import { FaBuilding } from "react-icons/fa";
import { MdRoom } from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FaRegClock } from "react-icons/fa6";
import { LuBookText } from "react-icons/lu";
import { MdFace } from "react-icons/md";
import { RiCoinsFill } from "react-icons/ri";
import { TbReceiptDollar } from "react-icons/tb";
import { MdOutlineFastfood } from "react-icons/md";
import { MdOutlinePets } from "react-icons/md";
import { useGetFacilitiesFromIdsQuery } from '../redux/api/hotelApiSlice';
import { useGetCitiesQuery } from '../redux/api/cityApiSlice';

const HotelInformation = ({ finalData }) => {
    const cityDt = finalData.city?._id || finalData.cityName;
    console.log(finalData)
        
    const { data: facilitiyIds, isLoading } = useGetFacilitiesFromIdsQuery(finalData.serviceFacilities);
    const [groupedFacilities, setGroupedFacilities] = useState({});
    const { data: cities, isLoading: isCitiesLoading } = useGetCitiesQuery();
    const [cityOptions, setCitiesOptions] = useState([]);

    useEffect(() => {
        if (!isLoading && facilitiyIds) {
            const groupedFacilities = facilitiyIds.reduce((acc, cur) => {
                const categoryName = cur.category.name;
                if (!acc[categoryName]) {
                    acc[categoryName] = [];
                }

                acc[categoryName].push(cur.name);
                return acc;
            }, {});
            setGroupedFacilities(groupedFacilities)
        }

        if (!isCitiesLoading && cities) {
            const ct = cities.map(city => ({
                _id: city._id, // dùng ObjectId
                name: city.name
            }));
            setCitiesOptions(ct)
        }
    }, [facilitiyIds, isLoading, cities, isCitiesLoading])

    if (isLoading || isCitiesLoading) return <div>Loading...</div>;
    const stripHtml = (html) => html.replace(/<[^>]*>?/gm, '').trim();

    return (
        <div>
            <div className='mb-7'>
                <div className="flex items-center space-x-2 mb-4">
                    <div className="w-2 h-7 bg-orange-500 rounded"></div>
                    <h2 className="text-[20px] font-semibold">Tổng quan</h2>
                </div>
                <div className='pl-5 space-y-3'>
                    <h3 className='text-xl font-bold'>
                        {finalData.name}
                    </h3>
                    <div className='flex items-center gap-4 '>
                        <p className='flex items-center text-[16px]'>
                            <FaBuilding className='text-blue-700 text-[14px] mx-1' /> {finalData.rooms} phòng
                        </p>
                        <p className='flex items-center text-[14px]'>
                            <MdRoom className='text-red-500 text-[20px] mx-1' /> {finalData.address},  
                            {cityOptions.find(city => String(city._id) === String(cityDt))?.name}
                        </p>
                    </div>
                    <p className='text-[16px] text-gray-500'>
                        {finalData.description}
                    </p>
                </div>
            </div>
            <div className='mb-7'>
                <div className="flex items-center space-x-2 mb-4">
                    <div className="w-2 h-7 bg-orange-500 rounded"></div>
                    <h2 className="text-[20px] font-semibold">Dịch vụ và cơ sở vật chất</h2>
                </div>
                <div className='pl-5 space-y-3'>
                    {Object.entries(groupedFacilities).map(([category, items]) => (
                        <div key={category} className="mb-4">
                            <h3 className="font-semibold text-lg mb-2">{category}</h3>
                            <div className='grid grid-cols-2'>
                                {items.map((item, index) => (
                                    <p key={index} className='flex items-center text-gray-600'>
                                        <IoMdCheckmarkCircleOutline className='ml-1 mr-3 text-[18px]' />
                                        {item}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className='mb-7'>
                <div className="flex items-center space-x-2 mb-4">
                    <div className="w-2 h-7 bg-orange-500 rounded"></div>
                    <h2 className="text-[20px] font-semibold">Chính sách chỗ lưu trú</h2>
                </div>
                <div className='space-y-2'>
                    {finalData.policies.timeCheckin?.trim() && finalData.policies.timeCheckout?.trim() && (
                        <div>
                            <p className='flex items-center font-semibold mb-1'>
                                <FaRegClock className='text-[18px] ml-1 mr-2' />
                                Giờ nhận / trả phòng
                            </p>
                            <div className='mx-6 bg-slate-100 rounded-lg px-4 py-2'>
                                <p className='font-light text-[15px]'>
                                    Giờ nhận phòng: <span className='font-medium'>{finalData.policies.timeCheckin}</span>
                                </p>
                                <p className='font-light text-[15px]'>
                                    Giờ nhận phòng: <span className='font-medium'>{finalData.policies.timeCheckout}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {finalData.policies.checkinPolicy?.trim() &&
                        stripHtml(finalData.policies.checkinPolicy) !== '' && (
                            <div>
                                <p className='flex items-center font-semibold mb-1'>
                                    <LuBookText className='text-[18px] ml-1 mr-2' />
                                    Chính sách nhận phòng
                                </p>
                                <div
                                    className='policy-content mx-6'
                                    dangerouslySetInnerHTML={{ __html: finalData.policies.checkinPolicy }}
                                />
                            </div>
                        )}

                    {finalData.policies.childrenPolicy?.trim() &&
                        stripHtml(finalData.policies.childrenPolicy) !== '' && (
                            <div>
                                <p className='flex items-center font-semibold mb-1'>
                                    <MdFace className='text-[18px] ml-1 mr-2' />
                                    Chính sách trẻ em
                                </p>
                                <div
                                    className='policy-content mx-6'
                                    dangerouslySetInnerHTML={{ __html: finalData.policies.childrenPolicy }}
                                />
                            </div>
                        )}

                    {finalData.policies.allowPet?.trim() && (
                        <div>
                            <p className='flex items-center font-semibold mb-1'>
                                <MdOutlinePets className='text-[18px] ml-1 mr-2' />
                                Chính sách thú cưng
                            </p>
                            <p className='mx-7 text-[15px]'>{finalData.policies.allowPet}</p>
                        </div>
                    )}

                    {finalData.policies.mandatoryFees?.trim() &&
                        stripHtml(finalData.policies.mandatoryFees) !== '' && (
                            <div>
                                <p className='flex items-center font-semibold mb-1'>
                                    <RiCoinsFill className='text-[18px] ml-1 mr-2' />
                                    Phí bắt buộc
                                </p>
                                <div
                                    className='policy-content mx-6'
                                    dangerouslySetInnerHTML={{ __html: finalData.policies.mandatoryFees }}
                                />
                            </div>
                        )}

                    {finalData.policies.otherFees?.trim() &&
                        stripHtml(finalData.policies.otherFees) !== '' && (
                            <div>
                                <p className='flex items-center font-semibold mb-1'>
                                    <TbReceiptDollar className='text-[18px] ml-1 mr-2' />
                                    Các phí khác
                                </p>
                                <div
                                    className='policy-content mx-6'
                                    dangerouslySetInnerHTML={{ __html: finalData.policies.otherFees }}
                                />
                            </div>
                        )}

                    {finalData.policies.FoodDrinks?.trim() &&
                        stripHtml(finalData.policies.FoodDrinks) !== '' && (
                            <div>
                                <p className='flex items-center font-semibold mb-1'>
                                    <MdOutlineFastfood className='text-[18px] ml-1 mr-2' />
                                    Đồ ăn & thức uống
                                </p>
                                <div
                                    className='policy-content mx-6'
                                    dangerouslySetInnerHTML={{ __html: finalData.policies.FoodDrinks }}
                                />
                            </div>
                        )}
                </div>
            </div>
        </div>
    )
}


export default HotelInformation;