import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { useGetHotelByIdQuery, useGetFacilitiesByCategoryQuery, useUpdateHotelMutation } from '../../redux/api/hotelApiSlice';
import { useForm, Controller } from "react-hook-form";
import { FaChevronLeft } from "react-icons/fa6";
import FormInput from '../../components/FormInput';
import FormTextArea from '../../components/FormTextArea';
import FormSelect from '../../components/FormSelect';
import TextEditor from './TextEditor';
import 'leaflet/dist/leaflet.css';
import MapPicker from '../../components/MapPicker';
import { TreeSelect, message } from 'antd';
import { useUploadImagesMutation, useDeleteImageMutation } from '../../redux/api/uploadApiSlice';
import UploadImg from '../../components/UploadImg';
import { PET_POLICIES } from '../../constants/hotel';
import { useGetCitiesQuery } from '../../redux/api/cityApiSlice';
import { toast } from "react-toastify";

const UpdateHotel = () => {
    const navigate = useNavigate();
    const param = useParams();
    const [images, setImages] = useState([]);
    const [imagesBase64, setImagesBase64] = useState([]);
    const [uploadImgKey, setUploadImgKey] = useState(0);
    const [cityOptions, setCitiesOptions] = useState([]);

    const [updateHotel, { isLoading: isUpdatingHotel }] = useUpdateHotelMutation();
    const { data: facilities, isLoading: isLoadingFacilities } = useGetFacilitiesByCategoryQuery();
    const { data: hotelData, isLoading: isLoadingHotel } = useGetHotelByIdQuery(param._id);
    const [uploadHotelImages, { isLoading: isUploadLoading, isError: isUploadError, isSuccess }] = useUploadImagesMutation();
    const [deleteHotelImage, { isLoading: isDeletingImg, isSuccess: isSuccessDelete }] = useDeleteImageMutation();
    const { data: cities, isLoading: isCitiesLoading } = useGetCitiesQuery();

    const [messageApi, contextMessageHolder] = message.useMessage();

    const {
        register, handleSubmit, control, formState: { errors },
        getValues, setValue, watch, reset
    } = useForm({
        defaultValues: {
            name: "",
            img: [],
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
            }
        }
    })

    useEffect(() => {
        if (hotelData) {
            reset({
                name: hotelData.name || "",
                img: hotelData.img || [],
                description: hotelData.description || "",
                address: hotelData.address || "",
                cityName: hotelData.city?._id || undefined,
                lat: hotelData.lat || undefined,
                lng: hotelData.lng || undefined,
                rooms: hotelData.rooms || undefined,
                serviceFacilities: hotelData.serviceFacilities || [],
                policies: {
                    timeCheckin: hotelData.policies?.timeCheckin || "12:30",
                    timeCheckout: hotelData.policies?.timeCheckout || "12:30",
                    checkinPolicy: hotelData.policies?.checkinPolicy || "",
                    childrenPolicy: hotelData.policies?.childrenPolicy || "",
                    mandatoryFees: hotelData.policies?.mandatoryFees || "",
                    otherFees: hotelData.policies?.otherFees || "",
                    FoodDrinks: hotelData.policies?.FoodDrinks || "",
                    allowPet: hotelData.policies?.allowPet || ""
                }
            });
        }

        if (!isCitiesLoading && cities) {
            const ct = cities.map(city => ({
                _id: city._id,
                name: city.name
            }));
            setCitiesOptions(ct)
        }
    }, [hotelData, reset, cities, isCitiesLoading]);

    const handleImagesChange = async ({ newImages, deletedExisting }) => {
        if (deletedExisting) {
            const currentImgs = getValues("img");
            const updatedImgs = currentImgs.filter(publicId => publicId !== deletedExisting);
            setValue("img", updatedImgs);

            await deleteImagesFromCloudinary(deletedExisting);
        }
        if (newImages) {
            setImages(newImages);
            setImagesBase64(newImages.map((img) => img.base64));
        }
        console.log(newImages);
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

    const onSave = async () => {
        if (imagesBase64.length > 0) {
            const uploadedImgs = await uploadImagesToCloudinary(imagesBase64);
            const allImgs = [...getValues("img"), ...uploadedImgs]
            setValue("img", allImgs, { shouldValidate: true });
        }
        setUploadImgKey(prev => prev + 1);
        setImagesBase64([]);
        setImages([]);

        try {
            const res = await updateHotel({ hotelId: param._id, hotel: getValues() }).unwrap();
            toast.success("Sửa khách sạn thành công");
            navigate("/admin/manage-hotels");
        } catch (error) {
            toast.error("Sửa khách sạn thất bại");
            console.log(error);
        }

        // console.log("-", images);
        // console.log(getValues());
    }

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
                content: 'Thêm ảnh thành công!',
                duration: 2,
            })
        }
        

    }, [isUploadLoading, isUploadError, isSuccess]);

    useEffect(() => {
        if (isDeletingImg) {
            messageApi.open({
                key: 'deleting',
                type: 'loading',
                content: 'Đang xoá ảnh...',
                duration: 0,
            })
        }
        if (isSuccessDelete) {
            messageApi.open({
                key: 'deleting',
                type: 'success',
                content: 'Đã xoá ảnh!',
                duration: 2,
            })
        }
    }, [isDeletingImg, isSuccessDelete])

    return (
        <div>
            {(isLoadingHotel || isLoadingFacilities || isCitiesLoading) ? (
                <div className='p-8'>Đang tải dữ liệu khách sạn...</div>
            ) : (
                <div className='bg-softBlue min-h-screen p-4 md:p-8'>
                    {contextMessageHolder}
                    <div className='w-[85%] mx-auto'>
                        <div className='flex items-center mt-3'>
                            <FaChevronLeft
                                className='mr-2 text-[18px] hover:text-slate-400 duration-300'
                                onClick={() => navigate(`/admin/manage-hotels/hotel-detail/${hotelData._id}`)}
                            />
                            <p className='font-semibold text-[20px] md:text-[20px]'>Sửa khách sạn</p>
                        </div>
                        <div className='bg-white rounded-lg shadow-md mt-4 p-4 md:p-6'>
                            <form id='hotelForm'>
                                <FormInput
                                    label={"Tên khách sạn"}
                                    name={"name"}
                                    register={register}
                                    errors={errors}
                                    placeholder={"Nhập tên khách sạn"}
                                // validationRules = {{required: "Tên là bắt buộc"}}
                                />
                                <FormTextArea
                                    label={"Mô tả"}
                                    name={"description"}
                                    register={register}
                                    errors={errors}
                                    placeholder={"Nhập mô tả"}
                                    // validationRules={{ required: "Mô tả là bắt buộc" }}
                                    row={4}
                                />
                                <MapPicker
                                    form={{
                                        register,
                                        errors,
                                        getValues,
                                        watch,
                                        setValue
                                    }}
                                // validationRules = {{required: "Địa chỉ là bắt buộc" }}
                                />
                                <div className='flex gap-5 mb-3'>
                                    <FormSelect
                                        label={"Thành phố"}
                                        name={"cityName"}
                                        control={control}
                                        options={cityOptions}
                                        placeholder={"Chọn thành phố"}
                                        // validationRules={{ required: "Thành phố là bắt buộc" }}
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
                                    // validationRules = {{ required: "Số phòng là bắt buộc" }}
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
                                        // rules={{ required: "Cơ sở vật chất là bắt buộc" }}
                                        render={({ field }) => (
                                            <TreeSelect
                                                {...field}
                                                placeholder="Chọn cơ sở vật chất và dịch vụ"
                                                treeDefaultExpandAll
                                                multiple
                                                showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                                size="large"
                                                treeCheckable={true}
                                                className='w-full border rounded border-gray-300'
                                                treeData={facilities}
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
                                        <FormInput
                                            label={"Giờ Check-in"}
                                            name={"policies.timeCheckin"}
                                            register={register}
                                            errors={errors}
                                        // validationRules = {{required: "Giờ Check-in là bắt buộc"}}
                                        />
                                        <FormInput
                                            label={"Giờ Check-out"}
                                            name={"policies.timeCheckout"}
                                            register={register}
                                            errors={errors}
                                        // validationRules = {{required: "Giờ Check-out là bắt buộc"}}
                                        />
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
                                    <UploadImg
                                        label="Ảnh khách sạn"
                                        existingImages={watch("img") || []}
                                        newImages={images}
                                        onImagesChange={handleImagesChange}
                                        key={uploadImgKey}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className='flex justify-end mt-3'>
                            <button
                                form='hotelForm'
                                type='submit'
                                className="bg-blue-500 text-white p-2 rounded"
                                onClick={handleSubmit(onSave)}
                            >
                                Lưu khách sạn
                            </button>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default UpdateHotel;
