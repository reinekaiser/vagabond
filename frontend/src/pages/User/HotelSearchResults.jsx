import { useSearchParams } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react'
import { DatePicker, message, Select, Slider, Pagination } from 'antd';
import { Link, useNavigate } from "react-router-dom";
const { RangePicker } = DatePicker;
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { CiSearch } from "react-icons/ci";
import dayjs from 'dayjs';
import { LuMapPin } from "react-icons/lu";
import ExpandableCheckbox from '../../components/ExpandableCheckbox';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useGetFacilitiesQuery, useGetHotelsQuery } from '../../redux/api/hotelApiSlice';
import { ROOM_FACILITIES_OPTIONS } from '../../constants/hotel';
import { CLOUDINARY_BASE_URL } from '../../constants/hotel';
dayjs.extend(customParseFormat);
const dateFormat = 'DD/MM/YYYY';
dayjs.extend(weekday);
dayjs.extend(localeData);
import { useGetSearchHotelSuggestionQuery } from '../../redux/api/hotelApiSlice';
import { skipToken } from '@reduxjs/toolkit/query';
import { Box, CircularProgress } from '@mui/material';

const { Option } = Select;

const HotelSearchResults = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initLocation = searchParams.get("location");
    const initCheckIn = searchParams.get("checkIn");
    const initCheckOut = searchParams.get("checkOut");
    const initRooms = parseInt(searchParams.get("rooms"));
    const initAdults = parseInt(searchParams.get("adults"));

    const [hotels, setHotels] = useState([]);
    const [fcFilter, setFcFilter] = useState([]);
    const [fcRoomFilter, setRoomFcFilter] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 10000000]);
    const [sort, setSort] = useState('');
    const [page, setPage] = useState();
    const [facilities, setFacilities] = useState([]);
    const handleFacilitiesFilter = (selectedFacilities) => {
        setFcFilter(selectedFacilities);
    }
    const handleFacilitiesRoomFilter = (selectedFacilitiesRoom) => {
        setRoomFcFilter(selectedFacilitiesRoom);
    }
    const handleChangePage = (newPage) => {
        setPage(newPage);
    };
    const { data: facilitiesData, isLoading: isFacilitiesLoading } = useGetFacilitiesQuery();
    useEffect(() => {
        if (!isFacilitiesLoading && facilitiesData) {
            const fc = facilitiesData.map((facility) => ({
                value: facility._id,
                label: facility.name
            }));
            setFacilities(fc);
        }
    }, [isFacilitiesLoading, facilitiesData]);

    const { data: hotelsFilter = [], isLoading, refetch } = useGetHotelsQuery({
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        hotelFacilities: fcFilter,
        roomFacilities: fcRoomFilter,
        page: page,
        sort: sort,
        city: searchParams.get("location")
    });

    useEffect(() => {
        if (!isLoading && hotelsFilter) {
            setHotels(hotelsFilter.data);
            setPage(hotelsFilter.currentPage);
        }
    }, [hotelsFilter]);

    const [location, setLocation] = useState(initLocation || '');
    const [checkIn, setCheckIn] = useState(initCheckIn ? dayjs(initCheckIn, dateFormat) : null);
    const [checkOut, setCheckOut] = useState(initCheckOut ? dayjs(initCheckOut, dateFormat) : null);
    const [rooms, setRooms] = useState(initRooms || 1);
    const [adults, setAdults] = useState(initAdults || 2);
    const handleSearch = async () => {
        if (!location || !checkIn || !checkOut) {
            messageApi.error('Điền đầy đủ các thông tin');
            return;
        }
        setPriceRange([0, 10000000]);
        setFcFilter([]);
        setRoomFcFilter([]);
        setSort('');
        setPage(1);

        const params = new URLSearchParams();
        params.set("location", location);
        params.set("checkIn", checkIn.format(dateFormat));
        params.set("checkOut", checkOut.format(dateFormat));
        params.set("rooms", rooms);
        params.set("adults", adults);
        navigate(`/hotels/search?${params.toString()}`);
    };

    const [messageApi, contextMessageHolder] = message.useMessage();

    const handleClickHotelCard = (hotelId) => {
        const params = new URLSearchParams();
        params.set("location", location);
        if (checkIn) params.set("checkIn", checkIn.format(dateFormat));
        if (checkOut) params.set("checkOut", checkOut.format(dateFormat));
        params.set("rooms", rooms);
        params.set("adults", adults);

        navigate(`/hotels/${hotelId}?${params.toString()}`);
    }

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div className=''>
            {contextMessageHolder}
            <div className='bg-blue-900 py-2'>
                <div className='container mx-auto'>
                    <form onSubmit={(e) => e.preventDefault()}>
                        <SearchHotel location={location} setLocation={setLocation}
                            checkIn={checkIn} setCheckIn={setCheckIn}
                            checkOut={checkOut} setCheckOut={setCheckOut}
                            rooms={rooms} setRooms={setRooms}
                            adults={adults} setAdults={setAdults}
                            handleSearch={handleSearch}
                        />
                    </form>
                </div>
            </div>
            <div className='bg-gray-100 py-10'>
                <div className='container mx-auto'>
                    <div className='grid grid-cols-[30%_auto] gap-7'>
                        <div className='bg-white rounded-xl mt-5 px-8 py-6 h-fit'>
                            <div className='mb-4'>
                                <p className='text-[18px] font-semibold mb-2'>Cơ sở vật chất</p>
                                <ExpandableCheckbox options={facilities} selected={fcFilter} onChange={handleFacilitiesFilter} />
                            </div>
                            <div>
                                <p className='text-[18px] font-semibold mb-2'>Tiện nghi phòng</p>
                                <ExpandableCheckbox options={ROOM_FACILITIES_OPTIONS} selected={fcRoomFilter} onChange={handleFacilitiesRoomFilter} />
                            </div>
                            <div className='mb-3'>
                                <p className="font-semibold">Giá</p>
                                <Slider
                                    range
                                    min={0}
                                    max={10000000}
                                    step={100000}
                                    value={priceRange}
                                    onChange={(value) => setPriceRange(value)}
                                    tooltip={{
                                        formatter: (value) =>
                                            `${value.toLocaleString("vi-VN")} VND`,
                                    }}
                                    styles={{
                                        track: { background: "#3b82f6" },
                                        rail: { background: "#d9d9d9" },
                                        handle: {
                                            borderColor: "#3b82f6",
                                        },
                                    }}
                                />
                                <div className="flex items-center gap-2">
                                    <div className="border rounded-md px-2 py-1 text-sm flex-1">
                                        {priceRange[0].toLocaleString("vi-VN")} VND
                                    </div>
                                    <div className="h-[1px] w-2 bg-gray-300"></div>
                                    <div className="border rounded-md px-2 py-1 text-sm">
                                        {priceRange[1].toLocaleString("vi-VN")} VND
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='mt-5'>
                            {hotels?.length > 0 ? (
                                <div>
                                    <div className='flex items-center'>
                                        <div className='text-gray-500 text-[16px]'>Tìm thấy {hotelsFilter.totalHotels} khách sạn</div>
                                        <div className='ml-auto flex items-center pl-3 py-1 rounded-lg duration-300 bg-white w-fit mt-5'>
                                            <span className='text-[14px] font-medium'>Sắp xếp theo: </span>
                                            <Select
                                                className='custom-select'
                                                style={{ width: 100 }}
                                                defaultValue="suggest"
                                                optionLabelProp="label"
                                                onChange={(value) => {
                                                    setSort(value);
                                                }}
                                            >
                                                <Option value="suggest" label={<span style={{ fontWeight: "bold" }}>Đề cử</span>}>Đề cử</Option>
                                                <Option value="newest" label={<span style={{ fontWeight: "bold" }}>Mới nhất</span>}>Mới nhất</Option>
                                                <Option value="priceAsc" label={<span style={{ fontWeight: "bold" }}>Giá tăng</span>}>Giá tăng</Option>
                                                <Option value="priceDesc" label={<span style={{ fontWeight: "bold" }}>Giá giảm</span>}>Giá giảm</Option>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        {hotels?.map((hotel, index) => (
                                            <div key={index} className='mb-3'>
                                                <HotelCard hotel={hotel} handleClick={handleClickHotelCard} />
                                            </div>
                                        ))}
                                    </div>
                                    <Pagination
                                        total={hotelsFilter.totalPages}
                                        align='end'
                                        style={{
                                            marginTop: "20px",
                                        }}
                                        pageSize={hotelsFilter.pageSize}
                                        current={page}
                                        onChange={handleChangePage}
                                    />
                                </div>
                            ) : (
                                <p className='text-gray-500 text-[16px]'>Không có khách sạn</p>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </div >
    )
}

const SearchHotel = ({ location, setLocation, checkIn, setCheckIn, checkOut, setCheckOut, rooms, setRooms, adults, setAdults, handleSearch }) => {

    const [openDr, setOpenDr] = useState(false);
    const inputRef = useRef(null);
    const { data: searchSuggestions, error, isLoading: isSearching } = useGetSearchHotelSuggestionQuery(
        location ? { key: location } : skipToken
    );
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                if (open && searchSuggestions?.results?.length > 0 && location !== '') {
                    setLocation(searchSuggestions.results[0].name);
                }
                setOpenDr(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [location, openDr, searchSuggestions]);
    const [messageApi, contextMessageHolder] = message.useMessage();
    return (
        <div className={`flex items-center gap-2`}>
            {contextMessageHolder}
            <div ref={inputRef} className='relative rounded-lg bg-slate-100 py-2 px-3 w-full'>
                {/* <label className='text-[12px] text-gray-500 font-medium'>Địa điểm</label> */}
                <input
                    value={location}
                    onChange={(e) => {
                        setLocation(e.target.value);
                        setOpenDr(true);
                    }}
                    type='text'
                    placeholder='Nhập địa điểm, tên khách sạn'
                    className={`w-full outline-none bg-transparent placeholder-gray-400 placeholder:text-[14px] placeholder:font-normal font-semibold`}
                />
                <div className='absolute left-0 top-full mt-1 w-full z-10 rounded-lg'>
                    {openDr && searchSuggestions?.results?.length > 0 && location != '' && (
                        <div className='border border-gray-50 bg-white shadow-lg rounded-lg'>
                            {searchSuggestions.results.map((item, index) => (
                                <div
                                    key={index}
                                    className='hover:bg-gray-100 py-2 px-4 duration-300 text-[14px]'
                                    onClick={() => {
                                        setLocation(item.name);
                                        setOpenDr(false);
                                    }}
                                >
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className='rounded-lg bg-white py-[5px] px-3 w-full'>
                {/* <label className='text-[12px] text-gray-500 font-medium'>Ngày nhận / trả phòng</label> */}
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

            <div className='rounded-lg bg-white py-2 px-3 w-full'>
                {/* <label className='text-[12px] text-gray-500 font-medium'>Số khách và phòng</label> */}
                <GuestRoomSelector
                    rooms={rooms}
                    setRooms={setRooms}
                    adults={adults}
                    setAdults={setAdults}
                />
            </div>

            <div>
                <button
                    type='button'
                    className='flex items-center bg-orange-500 hover:bg-orange-700 text-white rounded-lg px-3 font-semibold text-[16px] w-[130px] h-[40px] cursor-pointer  duration-300'
                    onClick={() => {
                        handleSearch();
                    }}
                >
                    <CiSearch className='text-[24px] mr-1' />
                    Tìm kiếm
                </button>
            </div>
        </div>
    );
}

const HotelCard = ({ hotel, handleClick }) => {
    const roomTypes = hotel.roomTypes;
    const minPrice = Math.min(
        ...roomTypes.flatMap(roomType => roomType.rooms.map(room => room.price))
    );

    return (
        <div className='grid grid-cols-[20%_auto] rounded-xl bg-white gap-4 relative h-[180px] hover:shadow-lg duration-300'
            onClick={() => {
                handleClick(hotel._id);
            }}
        >
            <div>
                <img
                    src={`${CLOUDINARY_BASE_URL}/${hotel.img[0]}`}
                    alt='only'
                    className='rounded-tl-xl rounded-bl-xl w-full h-full object-cover'
                />
            </div>
            <div>
                <p className='font-medium text-[20px] py-2'>{hotel.name}</p>
                <div className='flex items-center pb-2'>
                    <LuMapPin className='text-gray-500 text-[14px]' />
                    <p className='text-gray-500 text-[14px]'>{hotel.address} {hotel.city.name}</p>
                </div>
                <div className='flex items-center gap-1'>
                    {hotel.serviceFacilities.slice(0, 3).map((fc, index) => (
                        <div key={index} className='text-[12px] text-gray-400 bg-gray-100 rounded px-1 font-light'>
                            <span className='truncate block max-w-[100px]'>{fc.name}</span>
                        </div>
                    ))}
                    <div className='text-[12px] text-gray-400 bg-gray-100 rounded px-1'>
                        ...
                    </div>
                </div>
                <div className='absolute right-[2%] bottom-[8%]'>
                    <p className='text-[24px] font-medium text-right'>{Number(minPrice).toLocaleString("vi-VN")} ₫</p>
                    <p className='text-[12px] text-right text-gray-400'>Giá phòng cho 1 đêm</p>
                    <div className='mt-1 flex items-center justify-end'>
                        <button
                            className='px-4 py-2 text-[16px] text-white bg-primary rounded-lg hover:bg-blue-600 duration-300'
                        >
                            Xem chi tiết
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
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
                type="button"
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
                                    type="button"
                                    className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-gray-700"
                                    onClick={() => handleChange(item.type, "decrease")}
                                >
                                    <AiOutlineMinus size={18} />
                                </button>
                                <span className="w-5 text-center">{item.value}</span>
                                <button
                                    type="button"
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
export default HotelSearchResults;
