import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "antd";
import { toast } from "react-toastify";
import { useUpdateTicketInTourMutation } from "../redux/api/tourApiSlice";
import FormInput from "./FormInput";
import FormTextArea from "./FormTextArea";
import { FiPlusCircle } from "react-icons/fi";
import { FaRegTimesCircle } from "react-icons/fa";
import TextEditor from "../pages/Admin/TextEditor";

const TicketEditModal = ({ open, onCancel, ticket, tourId, refetch }) => {
    const [updateTicketInTour, { isLoading }] = useUpdateTicketInTourMutation();

    const {
        control,
        getValues,
        handleSubmit,
        reset,
        register,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "",
            subtitle: "",
            description: "",
            prices: [],
            maxPerBooking: "",
            overview: "",
            voucherValidity: "",
            redemptionPolicy: {
                method: "",
                location: "",
            },
            cancellationPolicy: {
                isReschedule: false,
                reschedulePolicy: "",
                isRefund: false,
                refundPolicy: {
                    refundPercentage: [{ daysBefore: "", percent: "" }],
                    description: "",
                },
            },
            termsAndConditions: "",
        },
    });


    useEffect(() => {
        if (ticket && open) {
            reset({
                ...ticket,
            });
        }
    }, [ticket, open, reset]);

    const onSubmit = async (data) => {
        try {
            await updateTicketInTour({
                tourId,
                ticketId: ticket._id,
                ticketData: data,
            }).unwrap();
            toast.success("Cập nhật vé thành công");
            refetch()
            onCancel();
        } catch (err) {
            toast.error("Cập nhật thất bại");
            console.error("Cập nhật lỗi:", err);
        }
    };

    const [priceCount, setPriceCount] = useState(ticket?.prices?.length || 1);
    const [refundPolicyCount, setRefundPolicyCount] = useState(
        ticket?.cancellationPolicy?.refundPolicy?.refundPercentage?.length || 1
    );

    const addPriceField = () => {
        setPriceCount((prev) => prev + 1);
        setValue(`prices.${priceCount}`, {
            priceType: "",
            price: "",
            notes: "",
            minPerBooking: "",
            maxPerBooking: "",
        });
    };

    const removePriceField = (index) => {
        setPriceCount((prev) => prev - 1);
        const prices = getValues("prices");
        prices.splice(index, 1);
        setValue("prices", prices);
    };

    const addRefundPolicyField = () => {
        setRefundPolicyCount((prev) => prev + 1);
        setValue(
            `cancellationPolicy.refundPolicy.refundPercentage.${refundPolicyCount}`,
            { daysBefore: "", percent: "" }
        );
    };

    const removeRefundPolicyField = (index) => {
        setRefundPolicyCount((prev) => prev - 1);
        const refundPolicies = getValues(
            "cancellationPolicy.refundPolicy.refundPercentage"
        );
        refundPolicies.splice(index, 1);
        setValue(
            "cancellationPolicy.refundPolicy.refundPercentage",
            refundPolicies
        );
    };

    return (
        <Modal
            title="Cập nhật vé"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit(onSubmit)}
            confirmLoading={isLoading}
            okText="Cập nhật"
            width={"60%"}
        >
            <form className="space-y-4 text-base">
                <FormInput
                    label={"Tên vé"}
                    name={"title"}
                    register={register}
                    errors={errors}
                    // validationRules={{
                    //     required: "Tên là bắt buộc",
                    // }}
                    placeholder={"Tên vé"}
                ></FormInput>
                <FormInput
                    label={"Ghi chú vé"}
                    name={"subtitle"}
                    register={register}
                    errors={errors}
                    // validationRules={{
                    //     required: "Tên là bắt buộc",
                    // }}
                    placeholder={"Ghi chú vé"}
                ></FormInput>

                <FormTextArea
                    name="description"
                    label={"Mô tả"}
                    register={register}
                    errors={errors}
                    placeholder={"Nhập mô tả"}
                ></FormTextArea>

                <div className="">
                    <h3 className="text-base font-medium text-gray-900">
                        Giá vé
                    </h3>
                    {Array.from({ length: priceCount }).map((_, index) => (
                        <div
                            key={index}
                            className="mt-4 space-y-2 border p-2 rounded-md relative"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label={"Loại giá"}
                                    name={`prices.${index}.priceType`}
                                    register={register}
                                    validationRules={{
                                        required: "Loại giá là bắt buộc",
                                    }}
                                    errors={errors}
                                    isSmall
                                ></FormInput>

                                <FormInput
                                    label={"Giá"}
                                    name={`prices.${index}.price`}
                                    register={register}
                                    validationRules={{
                                        required: "Giá là bắt buộc",
                                    }}
                                    errors={errors}
                                    isSmall
                                    type="number"
                                ></FormInput>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput
                                    label={"Ghi chú"}
                                    name={`prices.${index}.notes`}
                                    register={register}
                                    errors={errors}
                                    isSmall
                                ></FormInput>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput
                                        label={"Số lượng đặt tối thiểu"}
                                        name={`prices.${index}.minPerBooking`}
                                        register={register}
                                        errors={errors}
                                        isSmall
                                        type="number"
                                    ></FormInput>

                                    <FormInput
                                        label={"Số lượng đặt tối đa"}
                                        name={`prices.${index}.maxPerBooking`}
                                        register={register}
                                        errors={errors}
                                        isSmall
                                        type="number"
                                    ></FormInput>
                                </div>
                            </div>

                            {priceCount > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removePriceField(index)}
                                    className="inline-flex items-center gap-2 text-sm text-red-500 hover:bg-red-100 rounded-full absolute right-4 top-2"
                                >
                                    <FaRegTimesCircle className="w-[18px] h-[18px]"></FaRegTimesCircle>
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={addPriceField}
                        className="mt-2 inline-flex items-center gap-3 px-3 py-1 border text-sm font-medium rounded-md text-blue-500  hover:bg-blue-100 border-blue-500"
                    >
                        <FiPlusCircle></FiPlusCircle>
                        Thêm loại giá
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                    <FormInput
                        label={"Số lượng vé tối đa"}
                        name={"maxQuantity"}
                        register={register}
                        errors={errors}
                        type="number"
                    ></FormInput>
                </div>
                <TextEditor
                    label={"Tổng quan"}
                    name="overview"
                    // validationRules={{
                    //     required: "Trải nghiệm tour là bắt buộc",
                    // }}
                    placeholder={"Giá vé đã/không bao gồm"}
                    control={control}
                    errors={errors}
                ></TextEditor>

                <FormTextArea
                    name="voucherValidity"
                    label={"Hiệu lực voucher"}
                    register={register}
                    errors={errors}
                    placeholder={"Nhập hiệu lực voucher"}
                ></FormTextArea>

                <div className="">
                    <h3 className="text-base font-medium text-gray-900">
                        Phương thức quy đổi
                    </h3>

                    <TextEditor
                        label={"Cách đổi phiếu"}
                        name="redemptionPolicy.method"
                        // validationRules={{
                        //     required: "Trải nghiệm tour là bắt buộc",
                        // }}
                        placeholder={""}
                        control={control}
                        errors={errors}
                        variants="text-sm mt-1"
                        isSmall
                    ></TextEditor>
                    <TextEditor
                        label={"Địa điểm đổi phiếu"}
                        name="redemptionPolicy.location"
                        // validationRules={{
                        //     required: "Trải nghiệm tour là bắt buộc",
                        // }}
                        placeholder={""}
                        control={control}
                        errors={errors}
                        variants="text-sm mt-1"
                        isSmall
                    ></TextEditor>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-base font-medium text-gray-900">
                        Hoàn tiền và đổi lịch
                    </h3>

                    <div className="mt-4 space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                {...register("cancellationPolicy.isReschedule")}
                                className="h-4 w-4 "
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Cho phép dời lịch
                            </label>
                        </div>

                        <FormTextArea
                            name="cancellationPolicy.reschedulePolicy"
                            label={"Chính sách đổi lịch"}
                            register={register}
                            errors={errors}
                            placeholder={"Nhập chính sách đổi lịch"}
                            isSmall
                        ></FormTextArea>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                {...register("cancellationPolicy.isRefund")}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Cho phép hoàn tiền
                            </label>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-md font-medium text-gray-900">
                                Chính sách hoàn tiền
                            </h4>
                            <h5>Các mức hoàn tiền</h5>
                            <div className="grid grid-cols-2 gap-2">
                                {Array.from({ length: refundPolicyCount }).map(
                                    (_, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-2 rounded-md relative"
                                        >
                                            <FormInput
                                                label={
                                                    "Số ngày trước khi hủy vé"
                                                }
                                                name={`cancellationPolicy.refundPolicy.refundPercentage.${index}.daysBefore`}
                                                register={register}
                                                errors={errors}
                                                isSmall
                                                type="number"
                                            ></FormInput>

                                            <FormInput
                                                label={"Phần trăm hoàn tiền"}
                                                name={`cancellationPolicy.refundPolicy.refundPercentage.${index}.percent`}
                                                register={register}
                                                errors={errors}
                                                isSmall
                                                type="number"
                                            ></FormInput>
                                            {refundPolicyCount > 1 && (
                                                <div className="flex items-end">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeRefundPolicyField(
                                                                index
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 text-sm text-red-500 hover:bg-red-100 rounded-full absolute right-2 top-2"
                                                    >
                                                        <FaRegTimesCircle className="w-[18px] h-[18px]"></FaRegTimesCircle>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={addRefundPolicyField}
                                className="mt-2 inline-flex items-center gap-3 px-3 py-1 border text-sm font-medium rounded-md text-blue-500  hover:bg-blue-100 border-blue-500"
                            >
                                <FiPlusCircle></FiPlusCircle>
                                Thêm mức hoàn tiền
                            </button>
                        </div>
                        <FormTextArea
                            name="cancellationPolicy.refundPolicy.description"
                            label={"Mô tả chính sách hoàn tiền"}
                            register={register}
                            errors={errors}
                            placeholder={"Nhập chính sách hoàn tiền"}
                            isSmall
                        ></FormTextArea>
                    </div>
                </div>

                <TextEditor
                    label={"Điều khoản và điều kiện"}
                    name="termsAndConditions"
                    // validationRules={{
                    //     required: "Trải nghiệm tour là bắt buộc",
                    // }}
                    placeholder={"Nhập iều khoản và điều kiện"}
                    control={control}
                    errors={errors}
                ></TextEditor>
            </form>
        </Modal>
    );
};

export default TicketEditModal;
