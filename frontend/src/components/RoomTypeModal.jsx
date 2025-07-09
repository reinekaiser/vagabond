import React, { useState, useEffect } from "react";
import { Modal, Select } from "antd";
import { useForm, Controller } from "react-hook-form";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import { TreeSelect, message } from 'antd';
import { ROOM_FACILITIES_OPTIONS, VIEW_OPTIONS } from "../constants/hotel";
const { Option } = Select;
import UploadImg from "./UploadImg";
import { useUploadImagesMutation, useDeleteImageMutation } from '../redux/api/uploadApiSlice'

const RoomTypeModal = ({
  visible,
  onCancel,
  onAddRoomType,
  onUpdateRoomType,
  editingRoomType,
}) => {
  const [messageApi, contextMessageHolder] = message.useMessage();
  const [uploadKey, setUploadKey] = useState(0);
  const [roomTypeImgs, setRoomTypeImages] = useState([]);
  const [roomTypeImagesBase64, setRoomTypeImagesBase64] = useState([]);
  const [uploadHotelImages, { isLoading: isUploadLoading, isError: isUploadError, isSuccess }] = useUploadImagesMutation();
  const [deleteHotelImage, { isLoading: isDeleting, isSuccess: isDeteted }] = useDeleteImageMutation();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    setValue,
    getValues,
    watch
  } = useForm({
    defaultValues: editingRoomType || {
      name: "",
      img: [],
      area: "",
      view: "",
      roomFacilities: [],
      rooms: []
    }
  })

  const treeData = [
    {
      title: "Chọn tất cả",
      value: "all",
      key: "all",
      children: ROOM_FACILITIES_OPTIONS.map((item) => ({
        title: item.label,
        value: item.value,
        key: item.value,
      })),
    },
  ];

  const handleRoomTypeImagesChange = async ({ newImages, deletedExisting }) => {
    if (deletedExisting) {
      await deleteImagesFromCloudinary(deletedExisting);
    }
    if (newImages) {
      setRoomTypeImages(newImages);
      setRoomTypeImagesBase64(newImages.map((img) => img.base64));
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
      console.log("deleted image - ", publicId)
    } catch (error) {
      console.log(error)
    }
  }

  const onSubmit = async (newRoomType) => {
    if (editingRoomType) {
      if (roomTypeImagesBase64.length > 0) {
        const uploadedImgs = await uploadImagesToCloudinary(roomTypeImagesBase64);
        const allImgs = [...getValues("img"), ...uploadedImgs]
        setValue("img", allImgs, { shouldValidate: true });
      }
      onUpdateRoomType(getValues())
      setRoomTypeImages([]);
      setRoomTypeImagesBase64([]);
      setUploadKey(prev => prev + 1);
      // console.log("roomtype - ", getValues())
    }
    else {
      if (roomTypeImagesBase64.length > 0) {
        const uploadedImgs = await uploadImagesToCloudinary(roomTypeImagesBase64);
        const allImgs = [...getValues("img"), ...uploadedImgs]
        setValue("img", allImgs, { shouldValidate: true });
      }
      onAddRoomType(getValues())
      setRoomTypeImages([]);
      setRoomTypeImagesBase64([]);
      setUploadKey(prev => prev + 1);
      // console.log("roomtype - ", getValues())
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
      messageApi.open({
        key: 'uploading',
        type: 'success',
        content: 'Thêm loại phòng thành công!',
        duration: 2,
      })
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
      styles={{
        content: {
          padding: 0,
          overflow: "hidden",
        },
        body: {
          fontSize: "16px",
        },
        footer: {
          padding: "16px",
        },
      }}
    >
      {contextMessageHolder}
      <p className="px-5 pb-2 pt-3 text-[18px] font-semibold">{editingRoomType ? "Sửa loại phòng" : "Thêm loại phòng"}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[80vh] px-5 pb-4">
        <FormInput
          label={"Tên loại phòng"}
          name={"name"}
          register={register}
          errors={errors}
          placeholder={"Nhập tên loại phòng"}
          className="mb-3"
          validationRules = {{required: "Tên là bắt buộc"}}
        />
        <FormInput
          label={"Diện tích (m²)"}
          type="number"
          name={"area"}
          register={register}
          errors={errors}
          placeholder={"Nhập diện tích phòng"}
          className="mb-3"
          validationRules = {{required: "Diện tích là bắt buộc"}}
        />
        <FormSelect
          label={"Hướng phòng"}
          name={"view"}
          control={control}
          placeholder={"Chọn tầm nhìn"}
          isMultiple={false}
          options={VIEW_OPTIONS}
          errors={errors}
          className="mb-3"
        />
        <div className="flex-1 mb-6">
          <label className="block font-medium mb-2 mr-4">
            Cơ sở vật chất
            <span className="text-red-500">*</span>
          </label>
          <Controller
            name="roomFacilities"
            control={control}
            rules={{ required: "Cơ sở vật chất là bắt buộc" }}
            render={({ field }) => (
              <TreeSelect
                {...field}
                placeholder="Chọn cơ sở vật chất và dịch vụ"
                className={`w-full ${errors["roomFacilities"] ? "border-red-500" : ""} border rounded border-gray-300`}
                size="large"
                treeCheckable={true}
                treeData={treeData}
                showCheckedStrategy={TreeSelect.SHOW_CHILD}
                treeDefaultExpandAll
                multiple
                allowClear
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
          {errors['roomFacilities'] && (
            <p className="text-red-500 text-sm mt-1">{errors['roomFacilities']?.message}</p>
          )}
        </div>
        <div>
          <UploadImg
            label="Ảnh khách sạn"
            existingImages={watch("img") || []}
            newImages={roomTypeImgs}
            onImagesChange={handleRoomTypeImagesChange}
            key={uploadKey}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {editingRoomType ? "Sửa loại phòng" : "Thêm loại phòng"}

          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoomTypeModal;
