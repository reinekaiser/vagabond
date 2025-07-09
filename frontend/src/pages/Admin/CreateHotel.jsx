import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import 'leaflet/dist/leaflet.css';
import { useForm, Controller, useFieldArray } from "react-hook-form";
import MapPicker from '../../components/MapPicker';
import { TreeSelect, message } from 'antd';
import { toast } from "react-toastify";
import UploadImg from '../../components/UploadImg';
import { useUploadImagesMutation, useDeleteImageMutation } from '../../redux/api/uploadApiSlice';
import FormInput from '../../components/FormInput';
import FormTextArea from '../../components/FormTextArea';
import FormSelect from '../../components/FormSelect';
import TextEditor from './TextEditor';
import RoomTypeModal from '../../components/RoomTypeModal';
import RoomModal from '../../components/RoomModal';
import { useGetFacilitiesByCategoryQuery, useCreateHotelMutation } from '../../redux/api/hotelApiSlice';
import HotelInformation from '../../components/HotelInformation';
import RoomTypesInfomation from '../../components/RoomTypesInfomation';
import { FaChevronLeft } from "react-icons/fa6";
import { CLOUDINARY_BASE_URL, PET_POLICIES } from '../../constants/hotel';
import { useGetCitiesQuery } from '../../redux/api/cityApiSlice';
import ImageGalleryFromCloudinary from '../../components/ImageGalleryFromCloudinary';

const CreateHotel = () => {
    const navigate = useNavigate();
    const {
        register, handleSubmit, control, formState: { errors },
        getValues, setValue, watch, reset
    } = useForm(
        {
            defaultValues: {
                name: "",
                description: "",
                address: "",
                cityName: undefined,
                lat: undefined,
                lng: undefined,
                rooms: undefined,
                serviceFacilities: [],
                policies: {
                    timeCheckin: "12:30",
                    timeCheckout: "12:30",
                    checkinPolicy: "",
                    childrenPolicy: "",
                    mandatoryFees: "",
                    otherFees: "",
                    FoodDrinks: "",
                    allowPet: ""
                },
                img: [],
                roomTypes: []
            }
        }
    );
    const { fields: roomTypesData, append: appendRoomType, remove: removeRoomType, update: updateRoomType } = useFieldArray({
        control,
        name: 'roomTypes'
    });

    const [step, setStep] = useState(1);
    const [cityOptions, setCitiesOptions] = useState([]);
    const [serviceFacilities, setServiceFacilities] = useState(watch("serviceFacilities"));
    const [isRoomTypeModalVisible, setIsRoomTypeModalVisible] = useState(false);
    const [isRoomModalVisible, setIsRoomModalVisible] = useState(false);
    const [editingRoomType, setEditingRoomType] = useState(null);
    const [editingRoomTypeIndex, setEditingRoomTypeIndex] = useState(null);
    const [editingRoom, setEditingRoom] = useState(null);
    const [editingRoomIndex, setEditingRoomIndex] = useState(null);
    const [uploadImgKey, setUploadImgKey] = useState(0);
    const [modalKey, setModalKey] = useState(0);
    const [modalRoomKey, setModalRoomKey] = useState(0);

    const [images, setImages] = useState([]);
    const [imagesBase64, setImagesBase64] = useState([]);

    const [uploadHotelImages, { isLoading: isUploadLoading, isError: isUploadError, isSuccess }] = useUploadImagesMutation();
    const [deleteHotelImage] = useDeleteImageMutation();
    const { data: facilities, isLoading: isFacilitiesLoading } = useGetFacilitiesByCategoryQuery();
    const { data: cities, isLoading: isCitiesLoading } = useGetCitiesQuery();
    const [createHotel, { isLoading: isCreateLoading, isError: isCreateError, isSuccess: isCreateSuccess }] = useCreateHotelMutation();

    useEffect(() => {
        if (cities) {
            const ct = cities.map(city => ({
                _id: city._id,
                name: city.name
            }));
            setCitiesOptions(ct)
        }
    }, [cities, setCitiesOptions])

    const handleFacilityChange = (values) => {
        let selectedFacilities = [];
        values.forEach((val) => {
            selectedFacilities.push(val);
        });
        setValue("serviceFacilities", selectedFacilities, { shouldValidate: true });
    };

    const handleImagesChange = async ({ newImages, deletedExisting }) => {
        if (deletedExisting) {
            await deleteImagesFromCloudinary(deletedExisting);
        }
        if (newImages) {
            setImages(newImages);
            setImagesBase64(newImages.map((img) => img.base64));
        }
    }

    const uploadImagesToCloudinary = async (imagesBase64) => {
        if (imagesBase64.length === 0) return [];
        try {
            const res = await uploadHotelImages({ data: imagesBase64 }).unwrap();
            return res;
        } catch (error) {
            console.log(error)
        }
    }
    const deleteImagesFromCloudinary = async (publicId) => {
        if (!publicId) return;
        try {
            await deleteHotelImage(publicId).unwrap()
            setValue("img", getValues("img").filter(id => id !== publicId));
        } catch (error) {
            console.log(error)
        }
    }

    const addHotel = async (e) => {
        // e.preventDefault();
        if (imagesBase64.length > 0) {
            const uploadedImgs = await uploadImagesToCloudinary(imagesBase64);
            const allImgs = [...getValues("img"), ...uploadedImgs]
            setValue("img", allImgs, { shouldValidate: true });
        }
        setUploadImgKey(prev => prev + 1);
        setImagesBase64([]);
        setImages([]);

        const finalData = getValues();
        console.log("hotel - ", finalData);

        const payload = getValues();
        try {
            const res = await createHotel(payload).unwrap();
            console.log("==> API addHotel được gọi lúc:", new Date().toISOString());
            toast.success("Thêm khách sạn thành công");
            navigate("/admin/manage-hotels");
        }
        catch (error) {
            toast.error("Thêm khách sạn thất bại");
            console.log(error);
        }
    }

    const [messageApi, contextMessageHolder] = message.useMessage();
    useEffect(() => {
        if (isUploadLoading) {
            messageApi.open({
                key: 'uploading',
                type: 'loading',
                content: 'Đang tải ảnh lên...',
                duration: 0,
            });
        }
        if (isUploadError) {
            messageApi.open({
                key: 'uploading',
                type: 'error',
                content: 'Tải ảnh thất bại!',
                duration: 2,
            });
        }
        if (isSuccess) {
            messageApi.open({
                key: 'uploading',
                type: 'success',
                content: 'Tải ảnh thành công!',
                duration: 2,
            })
        }
    }, [isUploadLoading, isUploadError, isSuccess]);

    const formHotel = () => {
        return (
            <div>
                <div className='flex items-center'>
                    <FaChevronLeft
                        className='mr-2 text-[18px] hover:text-slate-400 duration-300'
                        onClick={() => navigate('/admin/manage-hotels')}
                    />
                    <p className='font-semibold text-[20px] md:text-[24px]'>Thêm khách sạn</p>
                </div>
                <div className='bg-white rounded-lg shadow-md mt-4 p-4 md:p-6 '>
                    <form id='hotelForm'>
                        <FormInput
                            label={"Tên khách sạn"}
                            name={"name"}
                            register={register}
                            errors={errors}
                            placeholder={"Nhập tên khách sạn"}
                        validationRules = {{required: "Tên là bắt buộc"}}
                        />
                        <FormTextArea
                            label={"Mô tả"}
                            name={"description"}
                            register={register}
                            errors={errors}
                            placeholder={"Nhập mô tả"}
                            validationRules={{ required: "Mô tả là bắt buộc" }}
                            row={4}
                        />
                        <div className="">
                            <MapPicker
                                form={{
                                    register,
                                    errors,
                                    getValues,
                                    watch,
                                    setValue
                                }}
                            validationRules = {{required: "Địa chỉ là bắt buộc" }}
                            />
                        </div>
                        <div className='flex gap-5 mb-3'>
                            <FormSelect
                                label={"Thành phố"}
                                name={"cityName"}
                                control={control}
                                options={cityOptions}
                                placeholder={"Chọn thành phố"}
                                validationRules={{ required: "Thành phố là bắt buộc" }}
                                valueField="_id"
                                labelField="name"
                                errors={errors}
                                className='flex-1'
                            />
                            <FormInput
                                label={"Số phòng"}
                                type={"number"}
                                name={"rooms"}
                                register={register}
                                errors={errors}
                                placeholder={"Nhập số lượng phòng"}
                            validationRules = {{ required: "Số phòng là bắt buộc" }}
                            />
                        </div>
                        <div className="flex-1 mb-6">
                            <label className="block font-medium mb-2 mr-4">
                                Cơ sở vật chất và dịch vụ
                                <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="serviceFacilities"
                                control={control}
                                rules={{ required: "Cơ sở vật chất là bắt buộc" }}
                                render={({ field }) => (
                                    <TreeSelect
                                        {...field}
                                        value={serviceFacilities}
                                        onChange={(value) => {
                                            setServiceFacilities(value);
                                            handleFacilityChange(value);
                                        }}
                                        placeholder="Chọn cơ sở vật chất và dịch vụ"
                                        className={`w-full ${errors["serviceFacilities"] ? "border-red-500" : ""} border rounded border-gray-300`}
                                        size="large"
                                        treeCheckable={true}
                                        treeData={facilities}
                                        treeDefaultExpandAll
                                        multiple
                                        showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                    />
                                )}
                            />
                            {errors['serviceFacilities'] && (
                                <p className="text-red-500 text-sm mt-1">{errors['serviceFacilities']?.message}</p>
                            )}
                        </div>
                        <div className='space-y-5'>
                            <h3 className="font-semibold text-lg">Chính sách chỗ lưu trú</h3>
                            <div className='grid grid-cols-2 gap-5 mb-3'>
                                <div className="">
                                    <label className="block font-medium mb-2">
                                        Giờ Check-in
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register("policies.timeCheckin", { required: "Giờ check-in là bắt buộc" })}
                                        className={`w-full border p-2 rounded ${errors.policies?.timeCheckin ? "border-red-500" : "border-gray-300"}`}
                                    />
                                    {errors.policies?.timeCheckin && <p className="text-red-500 text-sm mt-1">{errors.policies.timeCheckin.message}</p>}
                                </div>

                                <div className="">
                                    <label className="block font-medium mb-2">
                                        Giờ Check-out
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register("policies.timeCheckout", { required: "Giờ check-out là bắt buộc" })}
                                        className={`w-full border p-2 rounded ${errors.policies?.timeCheckout ? "border-red-500" : "border-gray-300"}`}
                                    />
                                    {errors.policies?.timeCheckout && <p className="text-red-500 text-sm mt-1">{errors.policies.timeCheckout.message}</p>}
                                </div>
                            </div>

                            <TextEditor
                                label={"Chính sách Check-in"}
                                name={"policies.checkinPolicy"}
                                control={control}
                                placeholder={"Nhập chính sách check-in"}
                                errors={errors}
                            />

                            <TextEditor
                                label={"Chính sách trẻ em"}
                                name={"policies.childrenPolicy"}
                                control={control}
                                placeholder={"Nhập chính sách trẻ em"}
                                errors={errors}
                            />

                            <TextEditor
                                label={"Phí bắt buộc"}
                                name={"policies.mandatoryFees"}
                                control={control}
                                placeholder={"Nhập các chính sách về phí bắt buộc"}
                                errors={errors}
                            />
                            <TextEditor
                                label={"Đồ ăn & Thức uống"}
                                name={"policies.FoodDrinks"}
                                control={control}
                                placeholder={"Nhập các chính sách về đồ ăn & thức uống"}
                                errors={errors}
                            />
                            <TextEditor
                                label={"Phí khác"}
                                name={"policies.otherFees"}
                                control={control}
                                placeholder={"Nhập các chính sách về phí khác"}
                                errors={errors}
                            />

                            <FormSelect
                                label={"Chính sách vật nuôi"}
                                name={"policies.allowPet"}
                                control={control}
                                options={PET_POLICIES}
                                placeholder={"Chọn"}
                                valueField="name"
                                labelField="name"
                                errors={errors}
                            />
                        </div>

                        <UploadImg
                            label="Ảnh khách sạn"
                            existingImages={watch("img") || []}
                            newImages={images}
                            onImagesChange={handleImagesChange}
                            key={uploadImgKey}
                        />
                    </form>
                </div>
                <div className='flex gap-5 justify-end'>
                    <button
                        type="button"
                        className="bg-blue-500 text-white p-2 rounded mt-3 mr-1"
                        onClick={() => {
                            setStep(2);
                            // console.log(images);
                        }}
                    >
                        Tiếp tục thêm loại phòng và phòng
                    </button>
                </div>
            </div>
        )
    }

    const formRoomType = () => {
        const roomTypes = watch('roomTypes')
        const deleteRoomTypeImagesFromCloudinary = async (publicId) => {
            if (!publicId) return;
            try {
                await deleteHotelImage(publicId).unwrap()
            } catch (error) {
                console.log(error)
            }
        }
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
            appendRoomType(newRoomType);
            handleCloseModalRoomType();
        }
        const handleRemoveRoomType = (index) => {
            if (roomTypesData[index].img && Array.isArray(roomTypesData[index].img)) {
                roomTypesData[index].img.forEach((img) => {
                    deleteRoomTypeImagesFromCloudinary(img);
                });
                roomTypesData[index].img = [];
            }
            removeRoomType(index)
        }
        const handleEditRoomType = (roomType, index) => {
            setEditingRoomTypeIndex(index);
            setEditingRoomType(roomType);
            setModalKey((prev) => prev + 1)
            // console.log(modalKey);
            setIsRoomTypeModalVisible(true);
        }
        const handleUpdateRoomType = (updatedRoomType) => {
            const updateRoomTypes = [...roomTypes];
            updateRoomTypes[editingRoomTypeIndex] = updatedRoomType
            setValue("roomTypes", updateRoomTypes)
            handleCloseModalRoomType();
        }
        //room
        const handleOpenRoomModal = (roomType, index) => {
            setEditingRoomTypeIndex(index)
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
        const handleAddRoom = (newRoom) => {
            const roomTypes = getValues("roomTypes");
            const updatedRoomType = {
                ...roomTypes[editingRoomTypeIndex],
                rooms: [...(roomTypes[editingRoomTypeIndex].rooms || []), newRoom],
            };
            updateRoomType(editingRoomTypeIndex, updatedRoomType);
            handleCloseRoomModal();
        }
        const handleRemoveRoom = (index, roomType, roomIndex) => {
            const updatedRooms = [...(roomType.rooms || [])];
            updatedRooms.splice(roomIndex, 1);

            const roomTypes = getValues("roomTypes");
            const updatedRoomType = {
                ...roomTypes[index],
                rooms: [...updatedRooms],
            };
            updateRoomType(index, updatedRoomType);
        }
        const handleEditRoom = (index, roomType, roomIndex, room) => {
            setEditingRoomTypeIndex(index);
            setEditingRoomType(roomType);
            setEditingRoomIndex(roomIndex);
            setEditingRoom(room)
            setModalRoomKey((prev) => prev + 1)
            setIsRoomModalVisible(true)
        }
        const handleUpdateRoom = (updatedRoom) => {
            const roomTypes = getValues("roomTypes");
            const currentRoomType = roomTypes[editingRoomTypeIndex];
            const updatedRooms = [...(currentRoomType.rooms || [])];
            updatedRooms[editingRoomIndex] = updatedRoom;
            const updatedRoomType = {
                ...currentRoomType,
                rooms: updatedRooms,
            };
            updateRoomType(editingRoomTypeIndex, updatedRoomType);
            handleCloseRoomModal();
        }

        return (
            <div>
                <div className='bg-white rounded-lg shadow-md mt-4 p-4 md:p-6 '>
                    <div className="flex items-baseline justify-between py-4 border-b">
                        <h2 className="font-semibold text-lg text-">
                            Thông tin loại phòng và phòng
                        </h2>
                        <button
                            onClick={() => handleOpenModalRoomType()}
                            type="button"
                            className="font-semibold border-[2px] border-blue-500 border-dashed text-blue-500 text-[14px] p-2 rounded"
                        >
                            + Thêm loại phòng
                        </button>

                        <RoomTypeModal
                            visible={isRoomTypeModalVisible}
                            onCancel={handleCloseModalRoomType}
                            onAddRoomType={handleAddRoomType}
                            onUpdateRoomType={handleUpdateRoomType}
                            editingRoomType={editingRoomType}
                            key={modalKey}
                        />
                    </div>
                    <div>
                        {roomTypes.length > 0 ? (
                            <div className='mt-5'>
                                {roomTypes.map((roomType, index) => (
                                    <div key={index} className='mb-4 '>
                                        <div className='bg-slate-100 p-4 rounded-md'>
                                            <div className='flex justify-between items-start'>
                                                <div className='w-[550px] mr-2 mt-2'>
                                                    <ImageGalleryFromCloudinary existingImages={roomType.img} option={2} />
                                                </div>
                                                <div className='space-y-1 text-[15px]'>
                                                    <h3 className='text-[18px] font-bold'>
                                                        {/* <span className='font-semibold'>Tên loại phòng: </span>  */}
                                                        {roomType.name}
                                                    </h3>
                                                    {roomType.area && <p>
                                                        <span className='font-semibold'>Diện tích: </span>
                                                        {roomType.area} m²
                                                    </p>}
                                                    {roomType.view && <p>
                                                        <span className='font-semibold'>Tầm nhìn: </span>
                                                        {roomType.view}
                                                    </p>}
                                                    {roomType.roomFacilities?.length > 0 && (
                                                        <div className=''>
                                                            <span className='font-semibold'>Cơ sở vật chất: </span>
                                                            <div className='flex flex-wrap gap-2 my-2'>
                                                                {roomType.roomFacilities?.map((facility, key) => (
                                                                    <p key={key} className='py-1 px-2 bg-green-100 rounded'>{facility}</p>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                </div>
                                                <div className="flex space-x-2 text-[14px]">
                                                    <button
                                                        onClick={() => {
                                                            handleEditRoomType(roomType, index);
                                                        }}
                                                        className="text-blue-500 hover:text-indigo-900"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            handleRemoveRoomType(index)
                                                        }}
                                                        className="text-red-500 hover:text-red-900"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>

                                            {roomType.rooms?.length > 0 && (
                                                <div className=''>
                                                    <h3 className="font-bold text-[18px] mt-3 mb-1">Danh sách phòng</h3>
                                                </div>
                                            )}
                                            {roomType.rooms?.map((room, roomIndex) => (
                                                <div key={roomIndex} className="relative p-2 rounded my-2 bg-white border">
                                                    <div className='flex justify-between items-start'>
                                                        <div className='space-y-1 text-[15px]'>
                                                            {room.bedType && (
                                                                <p>
                                                                    <span className='font-semibold'>Loại giường: </span>
                                                                    {room.bedType}
                                                                </p>
                                                            )}
                                                            {room.price && (
                                                                <p>
                                                                    <span className='font-semibold'>Giá: </span>
                                                                    {room.price.toLocaleString()} VNĐ
                                                                </p>
                                                            )}
                                                            {room.serveBreakfast && (
                                                                <p>
                                                                    <span className='font-semibold'>Bữa sáng: </span>
                                                                    {room.serveBreakfast}
                                                                </p>
                                                            )}
                                                            {room.cancellationPolicy.refund && (
                                                                <p>
                                                                    <span className='font-semibold'>Hoàn tiền: </span>
                                                                    {room.cancellationPolicy.refund}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex space-x-2 text-[13px]">
                                                            <button
                                                                onClick={() => {
                                                                    handleEditRoom(index, roomType, roomIndex, room);
                                                                }}
                                                                className="text-blue-500 hover:text-indigo-900"
                                                            >
                                                                Sửa
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleRemoveRoom(index, roomType, roomIndex)
                                                                }}
                                                                className="text-red-500 hover:text-red-900"
                                                            >
                                                                Xóa
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className='flex justify-end'>
                                                <button
                                                    onClick={() => {
                                                        handleOpenRoomModal(roomType, index)
                                                    }}
                                                    className="text-sm rounded bg-blue-400 text-white px-2 py-1"
                                                >
                                                    + Thêm phòng
                                                </button>
                                                <RoomModal
                                                    visible={isRoomModalVisible}
                                                    onCancel={handleCloseRoomModal}
                                                    onAddRoom={handleAddRoom}
                                                    onUpdateRoom={handleUpdateRoom}
                                                    editingRoom={editingRoom}
                                                    key={modalRoomKey}
                                                />
                                            </div>
                                        </div>


                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="p-2">Cần ít nhất một loại phòng và mỗi loại phòng phải có ít nhất 1 phòng</p>
                        )}
                    </div>
                </div>
                <div className='flex gap-5 justify-start mt-4'>
                    <button
                        onClick={() => {
                            setStep(1);
                            // console.log(images);
                            // console.log(imagesBase64)
                        }}
                        className="text-gray-600 bg-white px-6 py-2 rounded border border-1 border-gray-500"
                    >
                        Quay lại
                    </button>
                    <button
                        className="bg-blue-500 text-white p-2 rounded"
                        onClick={() => {
                            const roomTypes = getValues("roomTypes");
                            const hasRoomType = roomTypes.some((roomType) => roomType.rooms && roomType.rooms.length > 0);
                            if (!hasRoomType) {
                                messageApi.open({
                                    type: 'error',
                                    content: 'Cần ít nhất một loại phòng và mỗi loại phòng phải có ít nhất 1 phòng',
                                    duration: 2,
                                });
                            }
                            else {
                                setStep(3);
                            }
                            // console.log(getValues());
                        }}
                    >
                        Hoàn tất và xem lại
                    </button>
                </div>
            </div>
        )
    }

    const reviewForm = () => {
        const existingImages = watch("img") || [];
        const finalData = getValues();
        const roomTypesData = finalData.roomTypes;

        return (
            <div>
                <div className='bg-white rounded-lg shadow-md mt-4 p-4 md:p-6'>
                    <HotelInformation finalData={finalData} />
                    {(existingImages.length > 0 || images.length > 0) && (
                        <div className=''>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="w-2 h-7 bg-orange-500 rounded"></div>
                                <h2 className="text-[20px] font-semibold">Ảnh đã chọn</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-4">
                                {/* Ảnh hiện có */}
                                {existingImages.map((publicId, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={`${CLOUDINARY_BASE_URL}/${publicId}`}
                                            alt={`hotel-${publicId}`}
                                            className="w-full h-32 object-cover rounded shadow"
                                        />

                                    </div>
                                ))}
                                {/* Ảnh mới */}
                                {images.map((img) => (
                                    <div key={img.id} className="relative group">
                                        <img
                                            src={img.preview}
                                            alt={`preview-${img.id}`}
                                            className="w-full h-32 object-cover rounded shadow"
                                        />

                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <RoomTypesInfomation
                        roomTypesData={roomTypesData}
                        // images={images}
                        review={1}
                    />

                </div>

                <div className='flex gap-5 justify-start mt-4'>
                    <button
                        onClick={() => {
                            setStep(2);
                        }}
                        className="text-gray-600 bg-white px-6 py-2 rounded border border-1 border-gray-500"
                    >
                        Quay lại
                    </button>
                    <button
                        form="hotelForm"
                        type='submit'
                        className="bg-blue-500 text-white p-2 rounded"
                        onClick={() => {
                            handleSubmit(addHotel)();
                        }}
                    >
                        Thêm khách sạn
                    </button>
                </div>
            </div>


        );
    };

    return (
        <div>
            {(isFacilitiesLoading || isCitiesLoading) ? (
                <div>Loading...</div>
            ) : (
                <div className='bg-softBlue min-h-screen p-4 md:p-8'>
                    {contextMessageHolder}
                    <div className='w-[85%] mx-auto'>
                        {step === 1 && formHotel()}
                        {step === 2 && formRoomType()}
                        {step === 3 && reviewForm()}
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateHotel;