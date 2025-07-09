import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import FormInput from "./FormInput";
import FormTextArea from "./FormTextArea";
import { FiPlusCircle } from "react-icons/fi";
import { FaRegTimesCircle } from "react-icons/fa";
import TextEditor from "../pages/Admin/TextEditor";

const TicketForm = ({
    onAddTicket = () => {},
    onUpdateTicket = () => {},
    editingTicket = null,
    onCancelEdit = () => {},
    useDefaultPolicy = false,
    setUseDefaultPolicy = () => {},
    defaultPolicyValues = {},
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
        defaultValues: editingTicket || {
            title: "",
                // "Tour ghép - Nhóm lớn (Tối đa 29 khách) - Khởi hành thành phố Hồ Chí Minh",
            subtitle: "",
            description:
                "Tour kéo dài 6 giờ, có dịch vụ đón và trả khách miễn phí tại một số khu vực ở Quận 1, TP.HCM, trong khi khách ngoài khu vực này cần có mặt tại 57 Lê Thị Hồng Gấm trước 15 phút so với giờ khởi hành.",
            prices: [
                {
                    priceType: "Người lớn",
                    price: 562500,
                    notes: "Trên 9 tuổi",
                    minPerBooking: 1,
                    maxPerBooking: 20,
                },
            ],
            maxPerBooking: "",
            overview:
                '<h3><span style="color: rgb(0, 0, 0);">Giá đã bao gồm</span></h3><p><span style="color: rgb(3, 18, 26);">Hướng dẫn viên </span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Hướng dẫn viên nói tiếng Việt và Anh</span></li></ol><p><span style="color: rgb(3, 18, 26);">Bữa ăn </span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">1 chai nước suối</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Trà và sắn</span></li></ol><p><span style="color: rgb(3, 18, 26);">Phương tiện di chuyển</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Xe buýt có điều hoà</span></li></ol><p><span style="color: rgb(3, 18, 26);">Dịch vụ khác</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Chi phí tham quan</span></li></ol><h3><span style="color: rgb(0, 0, 0);">Giá không bao gồm</span></h3><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Phí bắn súng</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Ăn uống ngoài chương trình</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Bảo hiểm du lịch</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Tiền tip</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Chi tiêu cá nhân</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Các chi phí khác không được đề cập</span></li></ol><p><br></p>',
            voucherValidity: "Có hiệu lực vào mọi ngày bình thường\nCó hiệu lực vào mọi ngày lễ",
            redemptionPolicy: {
                method: '<p><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">1. Xuất trình voucher trên điện thoại cho nhân viên kiểm tra. Điều chỉnh độ sáng nếu cần.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">2. Xuất trình giấy tờ tùy thân bản gốc và hợp lệ để xác minh.</span></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">3. Chỉ chấp nhận voucher hợp lệ. Biên lai hoặc bằng chứng thanh toán không được sử dụng để vào cổng.</span></p><p><br></p>',
                location: "",
            },
            cancellationPolicy: {
                isReschedule: false,
                reschedulePolicy: "",
                isRefund: true,
                refundPolicy: {
                    refundPercentage: [{ daysBefore: "", percent: "" }],
                    description:
                        "Tất cả thời gian được tính theo giờ hoạt động tại địa phương.\nSố tiền hoàn lại cuối cùng sẽ không bao gồm phí dịch vụ, phiếu giảm giá và / hoặc phí chuyển khoản ngân hàng mã duy nhất.\nĐể hủy đặt chỗ của bạn và yêu cầu hoàn tiền, vui lòng truy cập mục Đặt chỗ của tôi. Trong phần Quản lý đặt chỗ, chạm vào Hoàn tiền và thực hiện theo quy trình gửi hoàn tiền (có trên Ứng dụng Traveloka phiên bản 3.18 trở lên hoặc trang web Traveloka trên máy tính).",
                },
            },
            termsAndConditions: 
                '<h3><strong style="color: rgb(0, 0, 0);">Thông tin chung</strong></h3><p><span style="color: rgb(3, 18, 26);">Chính sách miễn phí vé</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Trẻ em dưới 5 tuổi được miễn phí vé vào cửa. Nếu ngồi riêng trên xe buýt, phụ thu 200.000 VND/trẻ.</span></li></ol><p><span style="color: rgb(3, 18, 26);">Hiệu lực và chuyển nhượng vé</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Vé trẻ em áp dụng cho du khách từ 5 – 9 tuổi.</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Vé người lớn áp dụng cho du khách từ 10 tuổi trở lên.</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Yêu cầu giấy tờ tùy thân</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">SST Travel có quyền từ chối nhập cảnh nếu du khách không xuất trình giấy tờ tùy thân hợp lệ (CMND, hộ chiếu, v.v.).</span></li></ol><p><span style="color: rgb(3, 18, 26);">Điều kiện tham gia</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Trẻ em phải luôn đi cùng người lớn trong suốt chuyến tham quan.</span></li></ol><p><span style="color: rgb(3, 18, 26);">Lựa chọn thời gian tham gia</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Nhà điều hành tour sẽ liên hệ với du khách trong vòng 24 giờ sau khi đặt vé để xác nhận và cung cấp thông tin chi tiết. Nếu đặt vé vào ngày lễ/cuối tuần, thông tin sẽ được gửi vào ngày làm việc tiếp theo.</span></li></ol><p><span style="color: rgb(3, 18, 26);">Không có mặt khi đón khách</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Nếu du khách vắng mặt tại điểm đón, tour sẽ khởi hành và đặt chỗ bị hủy. Việc dời lịch có thể được xem xét dựa trên sự chấp thuận và tình trạng chỗ trống của nhà điều hành.</span></li></ol><p><span style="color: rgb(3, 18, 26);">Thời tiết và bảo trì</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Lịch trình có thể thay đổi tùy theo điều kiện thời tiết, giao thông hoặc các tình huống bất khả kháng khác.</span></li></ol><p><span style="color: rgb(3, 18, 26);">Quy tắc an toàn và hành vi</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Trong mọi loại hình tour, du khách phải tuân thủ lịch trình và hướng dẫn của trưởng đoàn.</span></li></ol><p><span style="color: rgb(3, 18, 26);">Các điều khoản khác</span></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Tour ghép có thể có những du khách khác mà bạn chưa quen biết, trong khi tour riêng chỉ dành cho nhóm của bạn.</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="color: rgb(3, 18, 26);">Phương tiện di chuyển có thể thay đổi, nhà điều hành sẽ thay thế bằng dịch vụ tương đương dựa trên tình trạng sẵn có và tiêu chuẩn cam kết.</span></li></ol>',
            ...defaultPolicyValues,
        },
    });

    useEffect(() => {
        if (useDefaultPolicy && !editingTicket && defaultPolicyValues) {
            reset({
                ...getValues(),
                ...defaultPolicyValues,
            });
        }
    }, [useDefaultPolicy, defaultPolicyValues, reset]);

    const [priceCount, setPriceCount] = useState(
        editingTicket?.prices?.length || 1
    );
    const [refundPolicyCount, setRefundPolicyCount] = useState(
        editingTicket?.cancellationPolicy?.refundPolicy?.refundPercentage
            ?.length || 1
    );

    const onSubmit = (data) => {
        if (editingTicket) {
            onUpdateTicket(data);
        } else {
            onAddTicket(data);
        }
    };

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-base h-[450px] overflow-auto px-5 pb-2">
            <FormInput
                label={"Tên vé"}
                name={"title"}
                register={register}
                errors={errors}
                validationRules={{
                    required: "Tên là bắt buộc",
                }}
                placeholder={"Tên vé"}
            ></FormInput>
            <FormInput
                label={"Ghi chú vé"}
                name={"subtitle"}
                register={register}
                errors={errors}
                
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
                <h3 className="text-base font-medium text-gray-900">Giá vé</h3>
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
                                className="inline-flex items-center gap-2 text-sm text-red-500 hover:bg-red-100 rounded-full absolute right-2 top-0.5"
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
                validationRules={{
                    required: "Trải nghiệm tour là bắt buộc",
                }}
                placeholder={"Giá vé đã/không bao gồm"}
                control={control}
                errors={errors}
            ></TextEditor>
            <label className="flex items-center gap-2 text-base font-semibold">
                <input
                    type="checkbox"
                    className="h-4 w-4"
                    onChange={(e) => setUseDefaultPolicy(e.target.checked)}
                />
                Sử dụng các chính sách sau làm giá trị cho các vé tiếp theo
            </label>
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
                    placeholder={""}
                    control={control}
                    errors={errors}
                    variants="text-sm mt-1"
                    isSmall
                ></TextEditor>
                <TextEditor
                    label={"Địa điểm đổi phiếu"}
                    name="redemptionPolicy.location"
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
                                            label={"Số ngày trước khi hủy vé"}
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
            <div className="flex justify-end space-x-4">
                {editingTicket && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Hủy
                    </button>
                )}
                <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {editingTicket ? "Cập nhật vé" : "Thêm vé"}
                </button>
            </div>
        </form>
    );
};

export default TicketForm;
