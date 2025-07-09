import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useCreateRoomMutation, useCreateRoomTypeMutation, useDeleteHotelMutation, useDeleteRoomMutation, useDeleteRoomTypeMutation, useGetHotelByIdQuery, useGetRoomTypesQuery, useUpdateRoomMutation, useUpdateRoomTypeMutation } from '../../redux/api/hotelApiSlice';
import HotelInformation from '../../components/HotelInformation';
import ImageGalleryFromCloudinary from '../../components/ImageGalleryFromCloudinary';
import { FaAngleLeft } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { BiArea } from "react-icons/bi";
import { PiMountainsDuotone } from "react-icons/pi";
import { FaAngleRight } from "react-icons/fa6";
import { TbCoffeeOff } from "react-icons/tb";
import { TbCoffee } from "react-icons/tb";
import { MdOutlineCheckCircle } from "react-icons/md";
import { MdOutlineDoNotDisturbOn } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { Modal, Dropdown, Tooltip } from "antd";
import { IoBedOutline } from "react-icons/io5";
import { MdOutlinePeopleAlt } from "react-icons/md";
import { FaCircleCheck } from "react-icons/fa6";
import { LuCircleDollarSign } from "react-icons/lu";
import { MdOutlineAddHome } from "react-icons/md";
import { HiDotsVertical } from "react-icons/hi";
import { MdDeleteForever } from "react-icons/md";
import RoomTypeModal from '../../components/RoomTypeModal';
import RoomModal from '../../components/RoomModal';
import { toast } from "react-toastify";
import { message } from 'antd';
import { Box, CircularProgress } from '@mui/material';


const HotelDetails = () => {
    const param = useParams();
    const navigate = useNavigate();
    const { data: hotel, isLoading: isHotelLoading } = useGetHotelByIdQuery(param._id);
    const { data: roomTypesData, isLoading: isLoadingRoomTypes, refetch: refetchHotel } = useGetRoomTypesQuery(param._id);
    const [createRoomType, { isLoading: isAddingRoomType }] = useCreateRoomTypeMutation();
    const [updateRoomType, { isLoading: isUpdatingRoomType }] = useUpdateRoomTypeMutation();
    const [deleteRoomType, { isLoading: isDeletingRoomType }] = useDeleteRoomTypeMutation();
    const [createRoom, { isLoading: isAddingRoom }] = useCreateRoomMutation();
    const [updateRoom, { isLoading: isUpdatingRoom }] = useUpdateRoomMutation();
    const [deleteRoom, { isLoading: isDeletingRoom }] = useDeleteRoomMutation();
    const [deleteHotel, { isLoading: isDeletingHotel }] = useDeleteHotelMutation();

    const [newRoomType, setNewRoomType] = useState({});
    const [newRoom, setNewRoom] = useState([]);
    const [isRoomTypeModalVisible, setIsRoomTypeModalVisible] = useState(false);
    const [isRoomModalVisible, setIsRoomModalVisible] = useState(false);
    const [editingRoomType, setEditingRoomType] = useState(null);
    const [editingRoomTypeIndex, setEditingRoomTypeIndex] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);
    const [editingRoomIndex, setEditingRoomIndex] = useState(null);
    const [modalKey, setModalKey] = useState(100);
    const [modalRoomKey, setModalRoomKey] = useState(0);

    const handleOpenModalRoomType = () => {
        setEditingRoomType(null);
        setEditingRoomTypeIndex(null);
        setModalKey((prev) => prev + 1)
        setIsRoomTypeModalVisible(true)
    }
    const handleCloseModalRoomType = () => {
        setEditingRoomType(null);
        setEditingRoomTypeIndex(null);
        setIsRoomTypeModalVisible(false);
    }
    const handleAddRoomType = (newRoomType) => {
        setNewRoomType(newRoomType);
        handleOpenRoomModal();
        // handleCloseModalRoomType();
    }
    const handleAddRoomForRoomType = async (newRoom) => {
        setNewRoom(prev => [...prev, newRoom]);
        const updatedRooms = newRoomType.rooms ? [...newRoomType.rooms, newRoom] : [newRoom];
        const roomTypeData = {
            ...newRoomType,
            rooms: updatedRooms
        }

        console.log("addroomtype - ", param._id);
        console.log(roomTypeData);
        try {
            const res = await createRoomType({ hotelId: param._id, roomType: roomTypeData }).unwrap();
            toast.success("Thêm loại phòng và phòng thành công");
            await refetchHotel();
        } catch (error) {
            toast.error("Thêm loại phòng và phòng thất bại");
            console.error("Error adding room type:", error);
        }
        handleCloseRoomModal();
        handleCloseModalRoomType();
    }

    const [isDeleteRoomTypeModalVisible, setDeleteRoomTypeModalVisible] = useState(false);
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(null);
    const showDeleteRoomTypeModal = (roomTypeId) => {
        setSelectedRoomTypeId(roomTypeId);
        setDeleteRoomTypeModalVisible(true);
    };
    const confirmDeleteRoomType = async () => {
        try {
            const res = await deleteRoomType({
                hotelId: param._id,
                roomTypeId: selectedRoomTypeId,
            }).unwrap();
            toast.success(res.message);
            await refetchHotel();
        } catch (error) {
            toast.error("Xoá loại phòng và phòng thất bại");
            console.error("Error delete room type:", error);
        } finally {
            setDeleteRoomTypeModalVisible(false);
            setSelectedRoomTypeId(null);
        }
    };
    const handleEditRoomType = (roomType, roomTypeId) => {
        setEditingRoomTypeIndex(roomTypeId);
        setEditingRoomType(roomType);
        setModalKey((prev) => prev + 1)
        setIsRoomTypeModalVisible(true);
    }
    const handleUpdateRoomType = async (updatedRoomType) => {
        console.log("updateroomtype - ", param._id, "-", editingRoomTypeIndex);
        console.log(updatedRoomType);
        try {
            const res = await updateRoomType({ hotelId: param._id, roomTypeId: editingRoomTypeIndex, roomType: updatedRoomType }).unwrap();
            toast.success("Cập nhật loại phòng thành công");
            await refetchHotel();
        } catch (error) {
            toast.error("Cập nhật loại phòng thất bại");
            console.error("Error updating room type:", error);
        }
        handleCloseModalRoomType()
    }

    //room
    const handleOpenRoomModal = (roomType, roomTypeId) => {
        setEditingRoomTypeIndex(roomTypeId)
        setEditingRoomType(roomType)
        setModalRoomKey((prev) => prev + 1)
        setIsRoomModalVisible(true)
    }
    const handleCloseRoomModal = () => {
        setEditingRoomTypeIndex(null);
        setEditingRoomType(null);
        setEditingRoomIndex(null);
        setEditingRoom(null)
        setIsRoomModalVisible(false)
    }
    const handleAddRoom = async (newRoom) => {
        if (isRoomTypeModalVisible == true) {
            handleAddRoomForRoomType(newRoom);
        }
        else {
            console.log("addroom - ", editingRoomTypeIndex);
            console.log(newRoom);
            try {
                const res = await createRoom({ hotelId: param._id, roomTypeId: editingRoomTypeIndex, room: newRoom }).unwrap();
                toast.success("Thêm phòng thành công");
                await refetchHotel();
            } catch (error) {
                toast.error("Thêm phòng thất bại");
                console.error("Error adding room:", error);

            }
            handleCloseRoomModal();
        }
    }
    const handleEditRoom = (roomTypeId, roomType, roomId, room) => {
        setEditingRoomTypeIndex(roomTypeId);
        setEditingRoomType(roomType);
        setEditingRoomIndex(roomId);
        setEditingRoom(room)
        setModalRoomKey((prev) => prev + 1)
        setIsRoomModalVisible(true)
    }
    const handleUpdateRoom = async (updatedRoom) => {
        console.log("updateroom - ", param._id, "-", editingRoomTypeIndex, "-", editingRoomIndex)
        console.log(updatedRoom);
        try {
            const res = await updateRoom({ hotelId: param._id, roomTypeId: editingRoomTypeIndex, roomId: editingRoomIndex, room: updatedRoom }).unwrap();
            toast.success("Cập nhật phòng thành công");
            await refetchHotel();
        } catch (error) {
            toast.error("Cập nhật phòng thất bại");
            console.error("Error updating room:", error);

        }
        handleCloseRoomModal()
    }
    const [isDeleteRoomModalVisible, setDeleteRoomModalVisible] = useState(false);
    const [selectedRoomInfo, setSelectedRoomInfo] = useState(null); // { roomTypeId, roomId, roomTypeName }
    const showDeleteRoomModal = (roomTypeId, roomType, roomId) => {
        setSelectedRoomInfo({
            roomTypeId,
            roomId,
            roomTypeName: roomType.name,
        });
        setDeleteRoomModalVisible(true);
    };
    const confirmDeleteRoom = async () => {
        try {
            const { roomTypeId, roomId } = selectedRoomInfo;
            const res = await deleteRoom({
                hotelId: param._id,
                roomTypeId,
                roomId,
            }).unwrap();
            toast.success(res.message);
            await refetchHotel();
        } catch (error) {
            toast.error("Xoá phòng thất bại");
            console.error("Error delete room:", error);
        } finally {
            setDeleteRoomModalVisible(false);
            setSelectedRoomInfo(null);
        }
    };

    const [messageApi, contextMessageHolder] = message.useMessage();

    useEffect(() => {
        if (isDeletingRoom) {
            messageApi.open({
                key: 'deleteRoom',
                type: 'loading',
                content: 'Đang xoá...',
                duration: 0,
            });
        } else {
            messageApi.destroy('deleteRoom');
        }
    }, [isDeletingRoom]);

    useEffect(() => {
        if (isUpdatingRoom) {
            messageApi.open({
                key: 'updateRoom',
                type: 'loading',
                content: 'Đang cập nhật...',
                duration: 0,
            });
        } else {
            messageApi.destroy('updateRoom');
        }
    }, [isUpdatingRoom]);

    useEffect(() => {
        if (isDeletingRoomType) {
            messageApi.open({
                key: 'deleteRoomType',
                type: 'loading',
                content: 'Đang xoá...',
                duration: 0,
            });
        } else {
            messageApi.destroy('deleteRoomType');
        }
    }, [isDeletingRoomType]);

    useEffect(() => {
        if (isUpdatingRoomType) {
            messageApi.open({
                key: 'updateRoomType',
                type: 'loading',
                content: 'Đang cập nhật...',
                duration: 0,
            });
        } else {
            messageApi.destroy('updateRoomType');
        }
    }, [isUpdatingRoomType]);

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

    if (isHotelLoading || isLoadingRoomTypes) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <div className='bg-softBlue min-h-screen p-4 md:p-8'>
                {contextMessageHolder}
                <div className='w-[85%] mx-auto mt-4'>
                    <div className='flex items-center'>
                        <button
                            className='flex items-center text-[18px] font-semibold px-2 py-1 rounded-md'
                            onClick={() => navigate('/admin/manage-hotels')}
                        >
                            <FaAngleLeft className='mr-3 hover:text-slate-400 duration-300' />
                            Quay lại
                        </button>
                        <div
                            className='flex items-center ml-auto bg-blue-500 text-white py-1 px-2 rounded-lg text-[18px] font-medium hover:underline duration-300'
                            onClick={() =>
                                navigate(`/admin/manage-hotels/update-hotel/${hotel._id}`, {
                                    state: { hotel }
                                })
                            }
                        >
                            <MdEdit className='mr-2' />
                            Sửa khách sạn
                        </div>
                    </div>
                </div>
                <div className='w-[85%] mx-auto bg-white rounded-lg shadow-md mt-4 p-4 md:p-6'>
                    <div className='mb-7 border border-gray-200 rounded-lg'>
                        <ImageGalleryFromCloudinary existingImages={hotel.img} option={1} />
                    </div>
                    <HotelInformation finalData={hotel} />

                    <div className='flex items-center mb-4'>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-7 bg-orange-500 rounded"></div>
                            <h2 className="text-xl font-semibold">Danh sách phòng và loại phòng</h2>
                        </div>
                        <button
                            type="button"
                            className="ml-auto font-semibold text-white bg-blue-500 text-[14px] py-1 px-2 rounded"
                            onClick={() => handleOpenModalRoomType()}
                        >
                            + Thêm loại phòng
                        </button>
                    </div>

                    <RoomTypeModal
                        visible={isRoomTypeModalVisible}
                        onCancel={handleCloseModalRoomType}
                        key={modalKey || 'roomTypeModal'}
                        onAddRoomType={handleAddRoomType}
                        editingRoomType={editingRoomType}
                        onUpdateRoomType={handleUpdateRoomType}
                    />

                    <RoomModal
                        visible={isRoomModalVisible}
                        onCancel={handleCloseRoomModal}
                        key={modalRoomKey || 'roomModal'}
                        onAddRoom={handleAddRoom}
                        editingRoom={editingRoom}
                        onUpdateRoom={handleUpdateRoom}
                    />

                    {roomTypesData.map((roomType, index) => (
                        <RoomTypeCard key={index} roomType={roomType} images={hotel.img}
                            handleEditRoomType={handleEditRoomType} handleDeleteRoomType={showDeleteRoomTypeModal} handleOpenRoomModal={handleOpenRoomModal}
                            handleEditRoom={handleEditRoom} handleDeleteRoom={showDeleteRoomModal}
                        />
                    ))}

                    <Modal
                        title="Xác nhận xoá loại phòng"
                        open={isDeleteRoomTypeModalVisible}
                        onOk={confirmDeleteRoomType}
                        onCancel={() => setDeleteRoomTypeModalVisible(false)}
                        okText="Xoá"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <p>Bạn muốn xoá loại phòng và tất cả các phòng trong đó?</p>
                    </Modal>
                    <Modal
                        title="Xác nhận xoá phòng"
                        open={isDeleteRoomModalVisible}
                        onOk={confirmDeleteRoom}
                        onCancel={() => setDeleteRoomModalVisible(false)}
                        okText="Xoá"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <p>Bạn có chắc chắn muốn xoá phòng này trong loại phòng "{selectedRoomInfo?.roomTypeName}"?</p>
                    </Modal>
                </div>
                

            </div>
        </div>
    );
};

const RoomTypeCard = ({ roomType, images, handleEditRoomType, handleDeleteRoomType, handleOpenRoomModal, handleEditRoom, handleDeleteRoom }) => {
    const facilities = roomType.roomFacilities || [];
    const showMore = facilities.length > 6;
    const displayedFacilities = showMore ? facilities.slice(0, 6) : facilities;

    const rooms = roomType.rooms;
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

    const fullFacilitiesTooltip = (
        <div className="w-[800px]">
            <div className="grid grid-cols-4 gap-1 m-1">
                {facilities.map((item, index) => (
                    <p key={index} className='flex items-center text-gray-600 text-[14px]'>
                        <IoMdCheckmarkCircleOutline className='text-[15px] mr-[2px]' />
                        {item}
                    </p>
                ))}
            </div>
        </div>
    );

    return (
        <div className='bg-gray-100 px-4 py-3 rounded-sm mb-6 space-y-3'>
            <div className='flex items-center'>
                <p className='font-semibold text-lg flex-1'>{roomType.name}</p>
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: '1',
                                label: (
                                    <div className="flex items-center w-[200px]" onClick={() => { handleEditRoomType(roomType, roomType._id) }}>
                                        <MdEdit className="text-[20px] mr-2" />Sửa loại phòng
                                    </div>)
                            },
                            {
                                key: '2',
                                label: (
                                    <div className="flex items-center w-[200px]" onClick={() => { handleOpenRoomModal(roomType, roomType._id) }}>
                                        <MdOutlineAddHome className="text-[20px] mr-2" />Thêm phòng
                                    </div>)
                            },
                            {
                                key: '3',
                                label: (
                                    <div className="flex items-center w-[200px] text-red-500" onClick={() => { handleDeleteRoomType(roomType._id) }}>
                                        <MdDeleteForever className="text-[20px] mr-2" />Xoá loại phòng
                                    </div>)
                            },
                        ]
                    }}
                    trigger={['click']}
                >
                    <div className='rounded-full hover:bg-gray-200 w-[25px] h-[25px] flex justify-center items-center duration-300'>
                        <HiDotsVertical className='text-[18px]' />
                    </div>
                </Dropdown>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-[30%_70%] gap-4'>
                <div>
                    {Array.isArray(images) && images.every(img => typeof img === 'string') && (
                        // Nội dung khi review === 1 và images là mảng chuỗi
                        <div>
                            <ImageGalleryFromCloudinary
                                existingImages={roomType.img}
                                option={2}
                            />
                        </div>
                    )}
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
                    {rooms.map((room, index) => (
                        <div key={index} className='mb-1'>
                            <RoomCard roomType={roomType} room={room} handleEditRoom={handleEditRoom} handleDeleteRoom={handleDeleteRoom} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const RoomCard = ({ roomType, room, numberOfNight = 1, handleEditRoom, handleDeleteRoom }) => {
    const [visibleModal, setVisibleModal] = useState(false);
    const showModal = () => {
        setVisibleModal(true);
    };
    const closeModal = () => {
        setVisibleModal(false);
    }

    const infoRef = useRef(null);
    const priceRef = useRef(null);
    const policyRef = useRef(null);

    const scrollToRef = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div>
            <div className='grid grid-cols-[70%_26%_4%] items-end hover:shadow-lg transition duration-300'
            >
                <div className='bg-white py-4 px-4' onClick={showModal}>
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
                <div className='border-l border-gray-300 bg-white h-full flex flex-col justify-end items-end p-2' onClick={showModal}>
                    <div className='text-[16px] font-medium text-orange-500'>Giá phòng</div>
                    <div className="flex justify-end mb-3">
                        <p className="text-[18px] font-semibold border-b border-dashed border-black inline-block">
                            {Number(room.price).toLocaleString("vi-VN")} ₫
                        </p>
                    </div>
                </div>
                <div className='bg-white h-full pr-4 pt-2'>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: '1',
                                    label: (<div className='flex items-center w-[200px]' onClick={() => { handleEditRoom(roomType._id, roomType, room._id, room) }}>
                                        <MdEdit className='text-[20px] mr-2' />
                                        Sửa phòng
                                    </div>),
                                },
                                {
                                    key: '2',
                                    label: (<div className='flex items-center w-[200px] text-red-500' onClick={() => { handleDeleteRoom(roomType._id, roomType, room._id) }}>
                                        <MdDeleteForever className='text-[20px] mr-2' />
                                        Xoá phòng
                                    </div>),
                                },
                            ]
                        }}
                        trigger={['click']}
                    >
                        <div
                            className='rounded-full hover:bg-gray-200 w-[20px] h-[20px] flex justify-center items-center duration-300'
                        >
                            <HiDotsVertical className='text-[16px]' />
                        </div>
                    </Dropdown>
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
                        <div className="flex">
                            <p className="text-[16px] font-semibold inline-block">
                                Giá cho {numberOfNight} đêm
                            </p>
                            <div className="text-[18px] font-semibold inline-block ml-auto">
                                {Number(room.price * numberOfNight).toLocaleString("vi-VN")} ₫
                                <p className='text-[12px] font-normal text-gray-400'>Giá phòng/ {numberOfNight} đêm</p>
                            </div>
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

                        {room.cancellationPolicy.refund === "Không hoàn tiền" ? (
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
                                    <p className='mx-4'>Hủy miễn phí trước <span className='font-medium'>{room.cancellationPolicy.day} ngày</span> từ ngày đặt </p>
                                    <div className='flex items-center gap-2 mb-1'>
                                        <LuCircleDollarSign />
                                        <p className='font-semibold'>Sau thời hạn "Hủy miễn phí"</p>
                                    </div>
                                    <p className='mx-4'>
                                        Nếu huỷ sau ngày đặt sẽ tính phí 100% trên tổng giá
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
                                        Nếu bạn hủy trước <span className='font-medium'> {room.cancellationPolicy.day} ngày từ ngày đặt </span>
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
                        )}
                    </div>
                </div>
            </Modal >
        </div >
    )
}

export default HotelDetails;
