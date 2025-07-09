import React, { useState, useEffect, useRef } from 'react'
import { DatePicker, message } from 'antd';
import { Link, useNavigate } from "react-router-dom";
const { RangePicker } = DatePicker;
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { CiSearch } from "react-icons/ci";
import { WHY_CHOOSE_FLIGHT } from '../../constants/hotel';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useGetSearchHotelSuggestionQuery } from '../../redux/api/hotelApiSlice';
import { skipToken } from '@reduxjs/toolkit/query';

dayjs.extend(customParseFormat);
const dateFormat = 'DD/MM/YYYY';
dayjs.extend(weekday);
dayjs.extend(localeData);

const HotelSearch = () => {
    const navigate = useNavigate();
    const [messageApi, contextMessageHolder] = message.useMessage();

    function SearchHotel() {
        const [location, setLocation] = useState('');
        const [checkIn, setCheckIn] = useState(null);
        const [checkOut, setCheckOut] = useState(null);
        const [rooms, setRooms] = useState(1);
        const [adults, setAdults] = useState(2);

        const [open, setOpen] = useState(false);
        const { data: searchSuggestions, error, isLoading: isSearching } = useGetSearchHotelSuggestionQuery(
            location ? { key: location } : skipToken
        );
        console.log(searchSuggestions)

        const handleSearch = () => {
            const params = new URLSearchParams();
            if (!location || !checkIn || !checkOut) {
                messageApi.error('Điền đầy đủ các thông tin');
                return;
            }
            params.set('location', location);
            params.set('checkIn', checkIn.format(dateFormat));
            params.set('checkOut', checkOut.format(dateFormat));
            params.set('rooms', rooms);
            params.set('adults', adults);

            navigate(`/hotels/search?${params.toString()}`);
        };

        const inputRef = useRef(null);
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (inputRef.current && !inputRef.current.contains(event.target)) {
                    if (open && searchSuggestions?.results?.length > 0 && location !== '') {
                        setLocation(searchSuggestions.results[0].name);
                    }
                    setOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, [location, open, searchSuggestions]);

        console.log(location)

        return (
            <div className={`flex items-center gap-2`}>
                <div ref={inputRef} className='relative rounded-lg bg-slate-100 py-2 px-3 w-full'>
                    <label className='text-[12px] text-gray-500 font-medium'>Địa điểm</label>
                    <input
                        value={location}
                        onChange={(e) => {
                            setLocation(e.target.value);
                            setOpen(true);
                        }}
                        type='text'
                        placeholder='Nhập địa điểm, tên khách sạn'
                        className={`w-full outline-none bg-transparent placeholder-gray-400 placeholder:text-[14px] placeholder:font-normal font-semibold`}
                    />
                    <div className='absolute left-0 top-full mt-1 w-full z-10 rounded-lg'>
                        {open && searchSuggestions?.results?.length > 0 && location != '' && (
                            <div className='border border-gray-50 bg-white shadow-lg rounded-lg'>
                                {searchSuggestions.results.map((item, index) => (
                                    <div
                                        key={index}
                                        className='hover:bg-gray-100 py-2 px-4 duration-300 text-[14px]'
                                        onClick={() => {
                                            setLocation(item.name);
                                            setOpen(false);
                                        }}
                                    >
                                        {item.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


                <div className='rounded-lg bg-slate-100 py-[5px] px-3 w-full'>
                    <label className='text-[12px] text-gray-500 font-medium'>Ngày nhận / trả phòng</label>
                    <RangePicker
                        className='rounded-lg bg-transparent w-full custom-range-picker font-semibold'
                        placeholder={['Chọn ngày', 'Chọn ngày']}
                        style={{ width: '100%' }}
                        suffixIcon={false}
                        value={checkIn && checkOut ? [checkIn, checkOut] : null}
                        format={dateFormat}
                        onChange={(dates) => {
                            if (dates) {
                                const [start, end] = dates;
                                if (start.isSame(end, "day")) {
                                    messageApi.error(
                                        "Ngày nhận và trả phòng không được trùng nhau!"
                                    );
                                    setCheckIn(null);
                                    setCheckOut(null);
                                    return;
                                }
                                setCheckIn(dates[0]);
                                setCheckOut(dates[1]);
                            } else {
                                setCheckIn(null);
                                setCheckOut(null);
                            }
                        }}
                        disabledDate={(current) => {
                            return current && current < dayjs().startOf('day');
                        }}
                    />
                </div>

                <div className='rounded-lg bg-slate-100 py-2 px-3 w-full'>
                    <label className='text-[12px] text-gray-500 font-medium'>Số khách và phòng</label>
                    <GuestRoomSelector
                        rooms={rooms}
                        setRooms={setRooms}
                        adults={adults}
                        setAdults={setAdults}
                    />
                </div>

                <div>
                    <button
                        className='flex items-center bg-primary text-white rounded-lg px-3 font-semibold text-[16px] w-[130px] h-[63px]'
                        onClick={handleSearch}
                    >
                        <CiSearch className='text-[24px] mr-1' />
                        Tìm kiếm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className=''>
            {contextMessageHolder}
            <div className='relative h-[300px]'>
                <div className='h-[240px]'>
                    <img
                        src='https://res.cloudinary.com/dsyzu0iij/image/upload/v1746241013/hotel-banner_cwf0av.jpg'
                        alt='hotel'
                        className='w-full h-full object-cover object-[center_70%]'
                    />
                </div>
                <div className='absolute text-white font-semibold p-2 top-[20%] left-[8%] '>
                    <p className='text-[30px] font-bold'>Khách sạn</p>
                    <p className='text-[20px]'>Lưu lại các điểm đến trong mơ và khám phá những hoạt động độc đáo nhất.</p>
                </div>
                <div className='absolute w-full bottom-[5%]'>
                    <div className='container mx-auto  px-4 bg-white py-4 rounded-xl shadow-custom'>
                        <SearchHotel
                        // initialValues={{ location: 'Đà Nẵng', checkIn: '02-05-2025', checkOut: '05-05-2025', rooms: 2, adults: 4 }}
                        />
                    </div>
                </div>
            </div>

            <div className='container mx-auto grid grid-cols-[35%_23%_40%] gap-2'>
                {WHY_CHOOSE_FLIGHT.map((item, index) => (
                    <div key={index} className='flex items-center gap-3 p-4'>
                        <img
                            src={item.img}
                            alt={item.title}
                            className='w-[50px] h-[50px] object-cover rounded-lg'
                        />
                        <div>
                            <h3 className='text-[18px] font-medium'>{item.title}</h3>
                            <p className='text-[14px] text-gray-500'>{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className='container mx-auto my-10'>
                <p className='text-[24px] font-semibold pb-3'>Quảng cáo</p>
                <div className='grid grid-cols-2'>
                    <img
                        src='https://res.cloudinary.com/dsyzu0iij/image/upload/v1746240990/promotion.jpeg_kz1obq.webp'
                        alt='hotel'
                        className='w-full object-cover object-center rounded-lg'
                    />
                </div>
            </div>

            {/* <div className='container mx-auto mt-10'>
                <p className='text-[24px] font-semibold pb-3'>Địa điểm nổi bật</p>
            </div> */}
        </div>
    )
}

const GuestRoomSelector = ({ rooms, setRooms, adults, setAdults }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const handleChange = (type, operation) => {
        const update = (prev, min = 0) => operation === "increase" ? prev + 1 : Math.max(prev - 1, min);
        if (type === "room") setRooms((prev) => update(prev, 1));
        if (type === "guest") setAdults((prev) => update(prev, 1));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={ref} className="relative w-full">
            <button
                className="text-[16px] font-semibold w-full text-left"
                onClick={() => setOpen((prev) => !prev)}
            >
                {`${adults} Người lớn, ${rooms} Phòng`}
            </button>
            {open && (
                <div className="absolute z-10 bg-white rounded-xl shadow-lg w-[300px] p-4 space-y-3 mt-2">
                    {[
                        { label: "Phòng", value: rooms, type: "room" },
                        { label: "Số khách", value: adults, type: "guest" },
                    ].map((item) => (
                        <div
                            key={item.type}
                            className="flex justify-between items-center border-b pb-4 last:border-b-0 last:pb-0"
                        >
                            <span className="text-base font-medium">{item.label}</span>
                            <div className="flex items-center space-x-3">
                                <button
                                    className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-gray-700"
                                    onClick={() => handleChange(item.type, "decrease")}
                                >
                                    <AiOutlineMinus size={18} />
                                </button>
                                <span className="w-5 text-center">{item.value}</span>
                                <button
                                    className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-gray-700"
                                    onClick={() => handleChange(item.type, "increase")}
                                >
                                    <AiOutlinePlus size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HotelSearch;
