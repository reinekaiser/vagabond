import React, { useState, useEffect } from 'react'
import { Modal, message, Rate } from "antd";
import UploadImg from "./UploadImg";
import { useForm, Controller } from "react-hook-form";
import { useUploadImagesMutation, useDeleteImageMutation } from '../redux/api/uploadApiSlice'
import FormTextArea from './FormTextArea';

const ReviewModal = ({ visible, onCancel, onAddReview, onUpdateReview, editingReview }) => {
    const [messageApi, contextMessageHolder] = message.useMessage();
    const [uploadKey, setUploadKey] = useState(0);
    const [images, setImages] = useState([]);
    const [imgesBase64, setImagesBase64] = useState([]);
    const [uploadImages, { isLoading: isUploadLoading, isError: isUploadError, isSuccess }] = useUploadImagesMutation();
    const [deleteImage, { isLoading: isDeleting, isSuccess: isDeteted }] = useDeleteImageMutation();

    const { register, handleSubmit, control, formState: { errors }, setValue, getValues, watch } = useForm({
        defaultValues: editingReview || {
            rating: 4.5,
            comment: "",
            images: [],
        }
    });

    const deleteImagesFromCloudinary = async (publicId) => {
        if (!publicId) return;
        try {
            await deleteImage(publicId).unwrap()
            setValue("images", getValues("images").filter(id => id !== publicId));
            console.log("deleted image - ", publicId)
        } catch (error) {
            console.log(error)
        }
    }
    const handleRoomTypeImagesChange = async ({ newImages, deletedExisting }) => {
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
            const res = await uploadImages({ data: imagesBase64 }).unwrap();
            return res;
        } catch (error) {
            console.log(error)
        }
    }

    const onSubmit = async (data) => {
        if (editingReview) {
            if (imgesBase64.length > 0) {
                const uploadedImages = await uploadImagesToCloudinary(imgesBase64);
                const allImgs = [...getValues("images"), ...uploadedImages];
                setValue("images", allImgs);
            }
            onUpdateReview(getValues());
            setImages([]);
            setImagesBase64([]);
            setUploadKey(prevKey => prevKey + 1);
        }
        else {
            if (imgesBase64.length > 0) {
                const uploadedImages = await uploadImagesToCloudinary(imgesBase64);
                const allImgs = [...getValues("images"), ...uploadedImages];
                setValue("images", allImgs);
            }
            onAddReview(getValues());
            setImages([]);
            setImagesBase64([]);
            setUploadKey(prevKey => prevKey + 1);
        }
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
            messageApi.destroy('uploading');
        }
    }, [isUploadLoading, isUploadError, isSuccess]);

    useEffect(() => {
        if (isDeleting) {
            messageApi.open({
                key: 'deleting',
                type: 'loading',
                content: 'Đang xóa ảnh...',
                duration: 0,
            })
        }
        if (isDeteted) {
            messageApi.open({
                key: 'deleting',
                type: 'success',
                content: 'Xóa ảnh thành công!',
                duration: 2,
            })
        }
    }, [isDeleting, isDeteted])

    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            width={"50%"}
            footer={null}
            centered
        >
            {contextMessageHolder}
            <p className="text-[18px] font-semibold mb-3">Thêm đánh giá</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className='text-[16px]'>
                    <label className="block font-semibold mb-2 mr-4">
                        Đánh giá
                    </label>
                    <Controller
                        name="rating"
                        control={control}
                        render={({ field }) => (
                            <Rate
                                {...field}
                                allowHalf
                                value={field.value || 4.5}
                                onChange={(value) => {
                                    field.onChange(value);
                                }}
                            />
                        )}
                    />
                </div>
                <FormTextArea
                    label="Nội dung đánh giá"
                    name="comment"
                    register={register}
                    errors={errors}
                    placeholder="Nhập nội dung đánh giá của bạn"
                />
                <UploadImg
                    label="Thêm ảnh"
                    existingImages={watch("images") || []}
                    newImages={images}
                    onImagesChange={handleRoomTypeImagesChange}
                    key={uploadKey}
                />

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded"
                    >
                        {editingReview ? "Sửa đánh giá" : "Thêm đánh giá"}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default ReviewModal