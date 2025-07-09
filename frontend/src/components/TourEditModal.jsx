import { Modal } from "antd";
import { useForm } from "react-hook-form";
import { useEffect, useState, useRef } from "react";
import UploadImg from "./UploadImg";
import {
    useDeleteImageMutation,
    useUploadImagesMutation,
} from "../redux/api/uploadApiSlice";
import { useUpdateTourMutation } from "../redux/api/tourApiSlice";
import FormInput from "./FormInput";
import TextEditor from "../pages/Admin/TextEditor";
import FormSelect from "./FormSelect";
import {
    CATEGORY_OPTIONS,
    CITY_OPTIONS,
    LANGUAGE_OPTIONS,
} from "../constants/tour";
import { useGetCitiesQuery } from "../redux/api/cityApiSlice";
import { toast } from "react-toastify";

const TourEditModal = ({ open, onCancel, tour, refetch }) => {
    const {
        control,
        getValues,
        handleSubmit,
        reset,
        register,
        setValue,
        formState: { errors },
        watch,
    } = useForm({
        defaultValues: {
            name: "",
            category: [],
            location: "",
            city: "",
            duration: "",
            experiences: "",
            languageService: [],
            contact: "",
            suitableFor: "",
            additionalInformation: "",
            itinerary: "",
            images: [],
        },
    });

    const [updateTour, isLoading] = useUpdateTourMutation();
    const { data: cities, isLoading: isCitiesLoading } = useGetCitiesQuery();

    const [cityOptions, setCitiesOptions] = useState([]);

    useEffect(() => {
        if (tour && open) {
            reset({
                name: tour.name,
                category: tour.category,
                location: tour.location,
                city: tour.city,
                duration: tour.duration,
                experiences: tour.experiences,
                languageService: tour.languageService,
                contact: tour.contact,
                suitableFor: tour.suitableFor,
                additionalInformation: tour.additionalInformation,
                itinerary: tour.itinerary,
                images: tour.images,
            });
        }

        if (!isCitiesLoading && cities) {
            const ct = cities.map((city) => ({
                _id: city._id,
                name: city.name,
            }));
            setCitiesOptions(ct);
        }
    }, [tour, open, reset, cities, isCitiesLoading]);

    const [
        uploadTourImages,
        {
            isLoading: isUploadLoading,
            isError: isUploadError,
            isSuccess: isUploadSuccess,
        },
    ] = useUploadImagesMutation();
    const [
        deleteTourImage,
        { isLoading: isDeletingImg, isSuccess: isSuccessDelete },
    ] = useDeleteImageMutation();

    const [uploadImgKey, setUploadImgKey] = useState(0);
    const [images, setImages] = useState([]);
    const [imagesBase64, setImagesBase64] = useState([]);

    const handleImagesChange = async ({ newImages, deletedExisting }) => {
        if (deletedExisting) {
            const currentImgs = getValues("images");
            const updatedImgs = currentImgs.filter(
                (publicId) => publicId !== deletedExisting
            );
            setValue("images", updatedImgs);

            await deleteImagesFromCloudinary(deletedExisting);
        }
        if (newImages) {
            setImages(newImages);
            setImagesBase64(newImages.map((img) => img.base64));
        }
    };

    const uploadImagesToCloudinary = async (imagesBase64) => {
        if (imagesBase64.length === 0) return [];
        try {
            const res = await uploadTourImages({
                data: imagesBase64,
            }).unwrap();
            return res;
        } catch (error) {
            console.log(error);
        }
    };

    const deleteImagesFromCloudinary = async (publicId) => {
        if (!publicId) return;
        try {
            await deleteTourImage(publicId).unwrap();
            setValue(
                "images",
                getValues("images").filter((id) => id !== publicId)
            );
        } catch (error) {
            console.log(error);
        }
    };

    const uploadToastId = useRef(null);

    useEffect(() => {
        if (isUploadLoading) {
            uploadToastId.current = toast.loading("Đang tải ảnh...");
        } else if (isUploadSuccess) {
            toast.update(uploadToastId.current, {
                render: "Tải ảnh thành công!",
                type: "success",
                isLoading: false,
                autoClose: 3000,
            });
        } else if (isUploadError) {
            toast.update(uploadToastId.current, {
                render: "Tải ảnh thất bại!",
                type: "error",
                isLoading: false,
                autoClose: 3000,
            });
        }
    }, [isUploadLoading, isUploadSuccess, isUploadError]);

    const onSubmit = async () => {
        if (imagesBase64.length > 0) {
            const uploadedImgs = await uploadImagesToCloudinary(imagesBase64);
            const allImgs = [...getValues("images"), ...uploadedImgs];
            setValue("images", allImgs);
        }
        setUploadImgKey((prev) => prev + 1);
        setImages([]);
        setImagesBase64([]);

        try {
            const res = await updateTour({
                tourId: tour._id,
                data: getValues(),
            }).unwrap();
            toast.success("Sửa tour thành công");
            refetch();
        } catch (error) {
            toast.error("Sửa tour thất bại");
            console.log(error);
        }

        onCancel();
    };

    return (
        <Modal
            title={<p className="px-5 pb-2 pt-4 text-[18px]">Cập nhật tour</p>}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit(onSubmit)}
            okText="Cập nhật"
            cancelText="Hủy"
            width={"60%"}
            centered
            styles={{
                content: {
                    padding: 0,
                },
                body: {
                    fontSize: "16px",
                },
                footer: {
                    padding: "16px"
                }
            }}
        >
            <div className="h-[450px] overflow-auto px-5 pb-2">
                <form>
                    <div className="">
                        <div className="space-y-4 overflow-auto">
                            <FormInput
                                label={"Tên tour"}
                                name={"name"}
                                register={register}
                                errors={errors}
                                // validationRules={{
                                //     required: "Tên là bắt buộc",
                                // }}
                                placeholder={"Tên tour"}
                            ></FormInput>

                            <FormInput
                                label={"Địa điểm"}
                                name={"location"}
                                placeholder={"Địa điểm"}
                                register={register}
                                errors={errors}
                                // validationRules={{
                                //     required: "Địa điểm là bắt buộc",
                                // }}
                            ></FormInput>
                            <FormSelect
                                label={"Loại tour"}
                                name={"category"}
                                placeholder={"Chọn loại tour"}
                                // validationRules={{
                                //     required: "Loại tour là bắt buộc",
                                // }}
                                options={CATEGORY_OPTIONS}
                                errors={errors}
                                control={control}
                                isMultiple={true}
                                valueField="value"
                                labelField="label"
                            ></FormSelect>

                            <div className="flex gap-2">
                                <FormSelect
                                    label={"Thành phố"}
                                    name={"city"}
                                    control={control}
                                    placeholder={"Chọn thành phố"}
                                    // validationRules={{
                                    //     required: "Thành phố là bắt buộc",
                                    // }}
                                    options={cityOptions}
                                    className="flex-1"
                                    errors={errors}
                                ></FormSelect>
                                <FormInput
                                    label={"Thời lượng tour"}
                                    name={"duration"}
                                    register={register}
                                    errors={errors}
                                    placeholder={"Nhập thời lượng tour"}
                                    // validationRules={{
                                    //     required: "Thời lượng tour là bắt buộc",
                                    // }}
                                    className="flex-1"
                                ></FormInput>
                            </div>
                            <TextEditor
                                label={"Trải nghiệm"}
                                name="experiences"
                                placeholder="Nhập các trải nghiệm của tour..."
                                // validationRules={{
                                //     required: "Trải nghiệm tour là bắt buộc",
                                // }}
                                control={control}
                                errors={errors}
                            ></TextEditor>
                            <FormSelect
                                label={"Dịch vụ ngôn ngữ"}
                                name={"languageService"}
                                placeholder={"Chọn dịch vụ ngôn ngữ có sẵn"}
                                // validationRules={{
                                //     required: "Dịch vụ ngôn ngữ là bắt buộc",
                                // }}
                                options={LANGUAGE_OPTIONS}
                                errors={errors}
                                control={control}
                                isMultiple={true}
                                valueField="value"
                                labelField="label"
                            ></FormSelect>
                            <div className="flex gap-2">
                                <FormInput
                                    label={"Phù hợp với"}
                                    name={"suitableFor"}
                                    placeholder={"Phù hợp với"}
                                    register={register}
                                    errors={errors}
                                    className="flex-1"
                                ></FormInput>
                                <FormInput
                                    label={"Liên hệ đối tác"}
                                    name={"contact"}
                                    placeholder={"Nhập số điện thoại"}
                                    register={register}
                                    errors={errors}
                                    className="flex-1"
                                ></FormInput>
                            </div>
                            <TextEditor
                                label={"Thông tin thêm"}
                                name="additionalInformation"
                                placeholder="Nhập lịch trình của tour..."
                                // validationRules={{
                                //     required: "Lịch trình tour là bắt buộc",
                                // }}
                                control={control}
                                errors={errors}
                            ></TextEditor>
                            <TextEditor
                                label={"Lịch trình"}
                                name="itinerary"
                                placeholder="Nhập lịch trình của tour..."
                                // validationRules={{
                                //     required: "Lịch trình tour là bắt buộc",
                                // }}
                                control={control}
                                errors={errors}
                            ></TextEditor>
                            <UploadImg
                                label="Ảnh tour"
                                existingImages={watch("images") || []}
                                newImages={images}
                                onImagesChange={handleImagesChange}
                                key={uploadImgKey}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default TourEditModal;
