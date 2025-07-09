import React, { useState, useMemo, useEffect } from 'react';
import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useDeleteHotelMutation, useGetFacilitiesQuery, useGetHotelsQuery, useGetRoomTypesQuery } from '../../redux/api/hotelApiSlice';
import { FaPlus } from "react-icons/fa6";
import { Select, Pagination, Modal } from "antd";
import ImageGalleryFromCloudinary from '../../components/ImageGalleryFromCloudinary';
import { MdRoom } from "react-icons/md";
import { LuCircleDollarSign } from "react-icons/lu";
import { HiDotsVertical } from "react-icons/hi";
import { TbEyeEdit } from "react-icons/tb";
import { MdDeleteForever } from "react-icons/md";
import { Drawer, Dropdown, Slider } from "antd";
import { MdFilterList } from "react-icons/md";
import ExpandableCheckbox from '../../components/ExpandableCheckbox';
import { ROOM_FACILITIES_OPTIONS } from '../../constants/hotel';
import { message } from 'antd';
import { toast } from "react-toastify";
import { Box, CircularProgress } from '@mui/material';

const { Option } = Select;

const ManageHotels = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [searched, setSearched] = useState(false);
    const [fcFilter, setFcFilter] = useState([]);
    const [fcRoomFilter, setRoomFcFilter] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 10000000]);
    const [sort, setSort] = useState('');
    const [page, setPage] = useState();
    const [facilities, setFacilities] = useState([]);
    const [openFilter, setOpenFilter] = useState(false);
    const { data: hotels = [], isLoading, refetch } = useGetHotelsQuery({
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        hotelFacilities: fcFilter,
        roomFacilities: fcRoomFilter,
        sort: sort,
        page: page,
    }, {
        refetchOnMountOrArgChange: true,
    });
    useEffect(() => {
        if (!isLoading && hotels) {
            setPage(hotels.currentPage);
        }
    }, [hotels]);
    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const { data: facilitiesData, isLoading: isFacilitiesLoading } = useGetFacilitiesQuery();


    const handleFacilitiesFilter = (selectedFacilities) => {
        setFcFilter(selectedFacilities);
    }
    const handleFacilitiesRoomFilter = (selectedFacilitiesRoom) => {
        setRoomFcFilter(selectedFacilitiesRoom);
    }
    useEffect(() => {
        if (!isFacilitiesLoading && facilitiesData) {
            const fc = facilitiesData.map((facility) => ({
                value: facility._id,
                label: facility.name
            }));
            setFacilities(fc);
        }
    }, [isFacilitiesLoading, facilitiesData]);


    const showDrawer = () => setOpenFilter(true);
    const onClose = () => setOpenFilter(false);

    const filteredResults = useMemo(() => {
        if (!search.trim()) return [];
        return hotels?.data?.filter((hotel) =>
            hotel?.name?.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, hotels]);

    const handleSearch = () => {
        if (search.trim() === "") {
            setSearched(false);
        } else {
            setSearched(true);
        }
    };

    if ((isLoading || isFacilitiesLoading)) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    // console.log(priceRange[0], priceRange[1], fcFilter, fcRoomFilter, sort);
    console.log(hotels)
    return (
        <div>
            <div className='bg-softBlue min-h-screen p-4 md:p-8'>
                <div className='mx-auto'>
                    <div className='flex items-center'>
                        <p className='flex-1 font-semibold text-[20px] md:text-[24px]'>Tất cả khách sạn</p>
                        <button
                            className='py-2 px-4 rounded-lg bg-blue-500 text-white font-semibold text-[14px] flex items-center'
                            onClick={() => navigate('/admin/manage-hotels/create-hotel')}

                        >
                            <FaPlus className='mr-2' />
                            Thêm khách sạn
                        </button>
                    </div>
                    <div className='bg-white rounded-lg shadow-md mt-4 p-4 md:p-6'>
                        {/* Search Bar */}
                        <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                            <span className='text-[16px] font-medium text-gray-500'>Tìm kiếm</span>
                            <div className='flex items-center border border-gray-300 rounded-lg p-2 focus-within:border-gray-600'>
                                <input
                                    type='text'
                                    placeholder='Search...'
                                    className='text-[14px] outline-none flex-1'
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        if (e.target.value.trim() === "") {
                                            setSearched(false);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch();
                                        }
                                    }}
                                />
                                <button onClick={handleSearch} className='p-1 hover:bg-gray-100 rounded-full'>
                                    <IoSearch className='text-gray-500 text-[20px]' />
                                </button>
                            </div>

                            <div className='flex items-center gap-2 ml-auto'>
                                <div
                                    onClick={showDrawer}
                                    className="py-2 px-3 flex items-center bg-white gap-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                                >
                                    <span className="text-[14px] font-semibold">Lọc</span>
                                    <MdFilterList className="text-[20px]"></MdFilterList>
                                </div>
                                <Drawer
                                    title="Lọc"
                                    placement="right"
                                    closable={false}
                                    onClose={onClose}
                                    open={openFilter}
                                >
                                    <div className='mb-4'>
                                        <p className='text-[18px] font-semibold mb-2'>Cơ sở vật chất</p>
                                        <ExpandableCheckbox options={facilities} selected={fcFilter} onChange={handleFacilitiesFilter} />
                                    </div>
                                    <div>
                                        <p className='text-[18px] font-semibold mb-2'>Tiện nghi phòng</p>
                                        <ExpandableCheckbox options={ROOM_FACILITIES_OPTIONS} selected={fcRoomFilter} onChange={handleFacilitiesRoomFilter} />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Giá</p>
                                        <Slider
                                            range
                                            min={0}
                                            max={10000000}
                                            step={1}
                                            value={priceRange}
                                            onChange={setPriceRange}
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
                                </Drawer>
                                <div className='ml-auto flex items-center pl-3 py-1 rounded-lg hover:bg-slate-100 duration-300'>
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

                        </div>

                        {/* Results */}
                        <div className='mt-4 p-4'>
                            {searched ? (
                                filteredResults.length > 0 ? (
                                    <>
                                        <p className='font-semibold text-[16px]'>Kết quả tìm kiếm</p>
                                        <div className='grid grid-cols-3 gap-3'>
                                            {filteredResults.map((hotel, index) => (
                                                <HotelCard key={index} hotel={hotel} />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className='text-[14px] font-medium text-gray-500'>Không tìm thấy</p>
                                )
                            ) : (
                                <div>
                                    <div className='grid grid-cols-3 gap-3'>
                                        {hotels?.data?.map((hotel, index) => (
                                            <HotelCard key={index} hotel={hotel} refetch={refetch}/>
                                        ))}
                                    </div>
                                    <Pagination
                                        total={hotels?.totalHotels}
                                        align='end'
                                        style={{
                                            marginTop: "20px",
                                        }}
                                        pageSize={hotels?.pageSize}
                                        current={page}
                                        onChange={handleChangePage}
                                    />

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HotelCard = ({ hotel, refetch }) => {
    const imgs = hotel.img;
    const { data: roomTypes = [], isLoading } = useGetRoomTypesQuery(hotel._id);
    const minPrice = Math.min(
        ...roomTypes.flatMap(roomType => roomType.rooms.map(room => room.price))
    );
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteHotel, { isLoading: isDeletingHotel }] = useDeleteHotelMutation();

    const handleDeleteHotel = async (hotelId) => {
        console.log("Xoá khách sạn - ", hotelId);
        try {
            const res = await deleteHotel(hotelId).unwrap();
            toast.success(res.message);
            refetch();
            setIsDeleteModalOpen(false);
        } catch (error) {
            toast.error("Xoá khách sạn thất bại");
            console.error("Error delete hotel:", error);
        }
    }

    const [messageApi, contextMessageHolder] = message.useMessage();
    useEffect(() => {
        if (isDeletingHotel) {
            messageApi.open({
                key: 'deleteHotel',
                type: 'loading',
                content: 'Đang xoá...',
                duration: 0,
            });
        } else {
            messageApi.destroy('deleteHotel');
        }
    }, [isDeletingHotel]);

    return (
        <div>
            {contextMessageHolder}
            {isLoading ? (
                <div className="p-2 rounded-lg shadow-md border border-gray-100 h-[360px] animate-pulse space-y-4">
                    <div className="h-[180px] bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-[60%] mx-2" />
                    <div className="h-5 bg-gray-300 rounded w-[80%] mx-2" />
                    <div className="h-4 bg-gray-200 rounded w-[70%] mx-2" />
                    <div className="h-5 bg-gray-300 rounded w-[40%] mx-2" />
                    <div className="absolute bottom-2 right-1 w-[30px] h-[30px] bg-gray-200 rounded-full" />
                </div>
            ) : (
                <div className='p-2 rounded-lg shadow-md border border-gray-100 h-[360px] relative hover:shadow-xl duration-300'>
                    {/* Nội dung chính */}
                    <ImageGalleryFromCloudinary existingImages={imgs} option={3} />
                    <div onClick={() => navigate(`/admin/manage-hotels/hotel-detail/${hotel._id}`)}>
                        <p className='text-[13px] text-gray-400 p-2 pt-4'>
                            Ngày thêm: {new Date(hotel.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        <h3 className="text-[20px] font-semibold hover:underline duration-300 px-2 pb-3 w-fit max-w-[325px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {hotel.name}
                        </h3>
                        <p className="flex text-[14px] mb-2">
                            <span className="text-red-500 text-[20px] mx-1 mt-[2px] shrink-0">
                                <MdRoom />
                            </span>
                            <span>
                                {hotel.address}, {hotel.city?.name}
                            </span>
                        </p>
                    </div>
                    <p className='flex items-center text-[14px] mb-2'>
                        <LuCircleDollarSign className='text-blue-500 text-[19px] mx-1' />
                        {Number(minPrice).toLocaleString("vi-VN")} ₫
                    </p>

                    {/* Dropdown ở góc dưới bên phải */}
                    <div className='absolute bottom-2 right-1'>
                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: '1',
                                        label: (
                                            <div className='flex items-center w-[130px]' onClick={() => navigate(`/admin/manage-hotels/hotel-detail/${hotel._id}`)}>
                                                <TbEyeEdit className='text-[20px] mr-2' />
                                                Xem và sửa
                                            </div>
                                        ),
                                    },
                                    {
                                        key: '2',
                                        label: (
                                            <div className='flex items-center w-[100px] text-red-500'
                                                onClick={() => setIsDeleteModalOpen(true)}
                                            >
                                                <MdDeleteForever className='text-[20px] mr-2' />
                                                Xoá
                                            </div>
                                        ),
                                    },
                                ]
                            }}
                            trigger={['click']}
                        >
                            <div className='rounded-full hover:bg-gray-200 w-[30px] h-[30px] flex justify-center items-center duration-300'>
                                <HiDotsVertical className='text-[18px]' />
                            </div>
                        </Dropdown>
                    </div>
                    <Modal
                        title="Xác nhận xóa hotel"
                        open={isDeleteModalOpen}
                        onOk={() => handleDeleteHotel(hotel._id)}
                        onCancel={() => setIsDeleteModalOpen(false)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true, loading: isLoading }}
                    >
                        <p>Bạn có chắc chắn muốn xoá hotel này không?</p>
                    </Modal>
                </div>
            )}
        </div>
    );
};



export default ManageHotels;