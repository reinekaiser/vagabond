import React, { useState, useEffect } from "react";
import { Modal, Select } from "antd";
import FormInput from "./FormInput";
import { useForm, Controller } from "react-hook-form";
import FormSelect from "./FormSelect";
import { BREAKFAST_OPTIONS, REFUND_OPTIONS } from "../constants/hotel";
const { Option } = Select;


const RoomModal = ({
  visible,
  onCancel,
  onAddRoom,
  onUpdateRoom,
  editingRoom
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    defaultValues: editingRoom || {
      bedType: "",
      serveBreakfast: "",
      maxOfGuest: "",
      numberOfRoom: "",
      cancellationPolicy: {
        refund: "",
        day: undefined,
        percentBeforeDay: undefined,
        percentAfterDay: undefined,
      },
      price: undefined
    }
  })

  const onSubmit = (newRoom) => {
    if (editingRoom){
      onUpdateRoom(newRoom);
    }
    else{
      onAddRoom(newRoom)
      // console.log(newRoom)
    }
  }

  return (
    <Modal
      open={visible}
      width={"50%"}
      height={"80%"}
      footer={null}
      onCancel={onCancel}
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
      <p className="text-[18px] font-semibold mb-1 px-4 pt-2">{editingRoom ? "Sửa phòng" : "Thêm phòng" }</p>
      <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[80vh] px-4 pt-2 pb-4">
        <FormInput
          label={"Tên phòng"}
          name={"bedType"}
          register={register}
          errors={errors}
          placeholder={"Nhập tên phòng"}
          validationRules={{required: "Tên phòng là bắt buộc"}}
        />
        
        <FormSelect
          label={"Bữa sáng"}
          name={"serveBreakfast"}
          control={control}
          options={BREAKFAST_OPTIONS}
          placeholder={"Chọn dịch vụ bữa sáng"}
          validationRules={{required: "Dịch vụ bữa sáng là bắt buộc"}}
          errors={errors}
        />

        <FormInput
          label={"Số khách tối đa"}
          type="number"
          name={"maxOfGuest"}
          register={register}
          errors={errors}
          placeholder={"Nhập số khách tối đa"}
          validationRules={{required: "Số khách là bắt buộc"}}
        />

        <FormInput
          label={"Số lượng phòng"}
          type="number"
          name={"numberOfRoom"}
          register={register}
          errors={errors}
          placeholder={"Nhập số phòng tối đa"}
          validationRules={{required: "Số phòng là bắt buộc"}}
        />

        <FormInput
          label={"Giá phòng (VND)"}
          type="number"
          name={"price"}
          register={register}
          errors={errors}
          placeholder={"Nhập giá phòng"}
          validationRules={{required: "Giá phòng là bắt buộc"}}
        />

        <p className="text-[16px] font-semibold mb-2 mt-5">
          Chính sách huỷ phòng
        </p>

        <div className="mb-1 flex items-center gap-3">
          <FormSelect
            label={"Hoàn tiền"}
            name={"cancellationPolicy.refund"}
            control={control}
            options={REFUND_OPTIONS}
            placeholder={"Lựa chọn hoàn tiền"}
            errors={errors}
            className="flex-1"
          />
        </div>

        <FormInput
          label={"Số ngày trước khi huỷ"}
          type="number"
          name={"cancellationPolicy.day"}
          register={register}
          errors={errors}
          placeholder={"Nhập số ngày"}
        />

        <FormInput
          label={"Phần trăm phải trả trước số ngày đó (dành cho hoàn tiền một phần)"}
          type="number"
          name={"cancellationPolicy.percentBeforeDay"}
          register={register}
          errors={errors}
          placeholder={"Nhập số %"}
        />

        <FormInput
          label={"Phần trăm phải trả sau số ngày đó (dành cho hoàn tiền một phần)"}
          type="number"
          name={"cancellationPolicy.percentAfterDay"}
          register={register}
          errors={errors}
          placeholder={"Nhập số %"}
        />

        <div className="flex justify-end mt-3">
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {editingRoom ? "Sửa phòng" : "Thêm phòng" }
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RoomModal;
