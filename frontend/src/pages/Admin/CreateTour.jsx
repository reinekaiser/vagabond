import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useCreateTourMutation } from "../../redux/api/tourApiSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FormInput from "../../components/FormInput";
import FormSelect from "../../components/FormSelect";
import TextEditor from "./TextEditor";
import { HiPlus } from "react-icons/hi";
import { useUploadImagesMutation, useDeleteImageMutation } from "../../redux/api/uploadApiSlice";
import { CiEdit } from "react-icons/ci";
import { MdOutlineDeleteForever } from "react-icons/md";
import { Modal } from "antd";
import TicketForm from "../../components/TicketForm";
import TourInformation from "../../components/TourInformation";
import UploadImg from "../../components/UploadImg";
import { CATEGORY_OPTIONS, LANGUAGE_OPTIONS } from "../../constants/tour";
import { useGetCitiesQuery } from "../../redux/api/cityApiSlice";

const cloudinaryBaseUrl = "https://res.cloudinary.com/dytiq61hf/image/upload/v1744375449";
const CreateTour = () => {
    const { data: cities, isLoading: isCitiesLoading } = useGetCitiesQuery();

    const [cityOptions, setCitiesOptions] = useState([]);

    useEffect(() => {
        if (!isCitiesLoading && cities) {
            const ct = cities.map((city) => ({
                _id: city._id,
                name: city.name,
            }));
            setCitiesOptions(ct);
        }
    }, [cities, isCitiesLoading]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        control,
        watch,
        setValue,
    } = useForm({
        defaultValues: {
            name: "Địa đạo Củ Chi - Tour nửa ngày SST Travel",
            location: "Củ Chi, Thành phố Hồ Chí Minh, Việt Nam",
            duration: "6 giờ",
            contact: "+84707260119",
            category: ["107"],
            languageService: ["200"],
            suitableFor: "Trẻ em & Gia đình, Khám phá văn hoá, Tham quan",
            images: [],
            additionalInformation:
                '<ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">Dịch vụ đón và trả khách miễn phí áp dụng tại các tuyến đường ở Quận 1, TP.HCM: Đề Thám, Phạm Ngũ Lão, Bùi Viện, Bùi Thị Xuân, Lê Lai. Thời gian đón sẽ được đơn vị tổ chức thông báo ít nhất 1 ngày trước khi tour bắt đầu.</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">Đối với khách ngoài khu vực trên, vui lòng có mặt tại 57 Lê Thị Hồng Gấm, Quận 1 ít nhất 15 phút trước giờ khởi hành để bắt đầu tour.</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">Tour ghép đoàn sẽ có sự tham gia của những khách khác mà bạn có thể chưa quen biết, trong khi tour riêng chỉ dành cho nhóm của bạn.</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">Vui lòng có mặt tại điểm đón trước 10 - 30 phút so với giờ khởi hành để đảm bảo lịch trình diễn ra suôn sẻ.</span></li></ol>',
            experiences:
                '<ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">Khám phá địa đạo Củ Chi huyền thoại với hệ thống đường hầm dài hơn 220 km</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">Xem video tư liệu giúp hiểu rõ hơn về lịch sử và tinh thần chiến đấu kiên cường</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">Thưởng thức trà chát và khoai mì, món ăn quen thuộc của du kích Việt Nam</span></li><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">Trải nghiệm bắn súng thật tại trường bắn để tăng thêm phần kịch tính</span></li></ol><p><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">Khám phá Địa đạo Củ Chi trong chuyến tham quan nửa ngày, nơi ghi dấu một mạng lưới đường hầm huyền thoại dài hơn 220 km! Cách trung tâm TP.HCM chỉ 60 km, điểm đến lịch sử này tái hiện cuộc sống kiên cường của du kích Việt Nam trong thời kỳ chiến tranh. Xem video tư liệu sinh động giúp bạn hiểu rõ hơn về quá khứ, sau đó khám phá hệ thống địa đạo bí mật, bao gồm khu sinh hoạt, bệnh viện dã chiến và tuyến tiếp tế thời chiến.</span></p><p><br></p><p><span style="background-color: rgb(255, 255, 255); color: rgb(3, 18, 26);">Sau hành trình dưới lòng đất, thư giãn với một tách trà chát và khoai mì, món ăn quen thuộc của chiến sĩ năm xưa. Nếu muốn thử cảm giác mạnh, hãy đến trường bắn và trải nghiệm bắn súng thật. Chọn giữa tour buổi sáng hoặc buổi chiều để phù hợp với lịch trình và tận hưởng chuyến đi đầy ý nghĩa. Đặt vé ngay để không bỏ lỡ hành trình thú vị này!</span></p>',
            itinerary:
                '<p><span style="color: rgb(3, 18, 26); background-color: rgb(255, 255, 255);">08:00-15:00 Dịch vụ đưa đón miễn phí áp dụng cho các địa điểm sau tại quận 1, thành phố Hồ Chí Minh: đường Đề Thám, Phạm Ngũ Lão, Bùi Viện, Bùi Thị Xuân, Lê Lai. Thời gian đón sẽ được nhà điều hành sắp xếp và thông báo đến khách ít nhất 1 ngày trước ngày đi tour </span></p><p><span style="color: rgb(3, 18, 26); background-color: rgb(255, 255, 255);">Khách nằm ngoài các địa điểm trên cần có mặt tại 57 Lê Thị Hồng Gấm (quận 1) ít nhất 15 phút trước giờ khởi hành để bắt đầu tour </span></p><p><span style="color: rgb(3, 18, 26); background-color: rgb(255, 255, 255);">Tour sáng: Rời thành phố Hồ Chí Minh để đến Củ Chi </span></p><p><span style="color: rgb(3, 18, 26); background-color: rgb(255, 255, 255);">Xem một bộ phim giới thiệu về lịch sử và những nhọc nhằn vùng đất này trải qua trong chiến tranh chống Mỹ, cũng như quá trình xây dựng địa đạo </span></p><p><span style="color: rgb(3, 18, 26); background-color: rgb(255, 255, 255);">Đến địa đạo Củ Chi. Khám phá những khu vực cho phép tham quan tại đây, bao gồm khu ở (phòng ngủ và nhà bếp) và khu vực quân sự (nhà kho, bệnh viện dã chiến, kho dự trữ vũ khí, và trung tâm chỉ huy) </span></p><p><span style="color: rgb(3, 18, 26); background-color: rgb(255, 255, 255);">Tham quan trường bắn súng (chi phí tự túc) </span></p><p><span style="color: rgb(3, 18, 26); background-color: rgb(255, 255, 255);">Ăn trưa với chi phí tự túc </span></p><p><span style="color: rgb(3, 18, 26); background-color: rgb(255, 255, 255);">Trở về trung tâm thành phố. Kết thúc tour. </span></p>',
        },
    });

    const [step, setStep] = useState(1);

    const [createTour, { isLoading, isSuccess }] = useCreateTourMutation();
    const navigate = useNavigate();

    const [tourData, setTourData] = useState(null);

    const onSubmitTour = (data) => {
        setStep(2);
        setTourData(data);
    };

    const [isTicketModalOpen, setisTicketModalOpen] = useState(false);

    const showModal = () => {
        setEditingIndex(null);
        setEditingTicket(null);
        setisTicketModalOpen(true);
        setFormKey((prev) => prev + 1);
    };
    const handleCancel = () => {
        setisTicketModalOpen(false);
    };

    const [tickets, setTickets] = useState([]);
    const [editingTicket, setEditingTicket] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    const [formKey, setFormKey] = useState(0);

    const [defaultPolicy, setDefaultPolicy] = useState(null);
    const [useDefaultPolicy, setUseDefaultPolicy] = useState(false);

    const handleAddTicket = (ticket) => {
        setTickets([...tickets, ticket]);

        if (useDefaultPolicy) {
            const { voucherValidity, redemptionPolicy, cancellationPolicy, termsAndConditions } =
                ticket;
            setDefaultPolicy({
                voucherValidity,
                redemptionPolicy,
                cancellationPolicy,
                termsAndConditions,
            });
        }

        setUseDefaultPolicy(false);
    };

    const handleUpdateTicket = (updatedTicket) => {
        const updatedTickets = [...tickets];
        updatedTickets[editingIndex] = updatedTicket;
        setTickets(updatedTickets);
        if (useDefaultPolicy) {
            const { voucherValidity, redemptionPolicy, cancellationPolicy, termsAndConditions } =
                updatedTicket;
            setDefaultPolicy({
                voucherValidity,
                redemptionPolicy,
                cancellationPolicy,
                termsAndConditions,
            });
        }

        setUseDefaultPolicy(false);
    };

    const handleEditTicket = (ticket, index) => {
        setEditingTicket(ticket);
        setEditingIndex(index);
        setFormKey((prev) => prev + 1);
        setisTicketModalOpen(true);
    };

    const handleDeleteTicket = (index) => {
        const newTickets = [...tickets];
        newTickets.splice(index, 1);
        setTickets(newTickets);

        if (editingIndex === index) {
            setEditingIndex(null);
            setEditingTicket(null);
        } else if (editingIndex > index) {
            setEditingIndex(editingIndex - 1);
        }
    };

    const handleCancelEdit = () => {
        setEditingTicket(null);
        setEditingIndex(null);
    };

    const [
        uploadTourImages,
        { isLoading: isUploadLoading, isError: isUploadError, isSuccess: isUploadSuccess },
    ] = useUploadImagesMutation();

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

    const finishTour = async (e) => {
        e.preventDefault();

        // Upload ảnh
        let uploadedImgs = [];
        if (imagesBase64.length > 0) {
            try {
                uploadedImgs = await uploadImagesToCloudinary(imagesBase64);
                console.log(uploadedImgs);
            } catch (error) {
                console.error("Upload ảnh thất bại!");
                return;
            }

            const existingImages = getValues("images") || []; // Bảo vệ nếu không có giá trị images
            const allImgs = [...existingImages, ...uploadedImgs];
            tourData.images = allImgs;
        }

        setUploadImgKey((prev) => prev + 1);
        setImagesBase64([]);
        setImages([]);

        const firstPrices = tickets
            .map((ticket) => ticket.prices[0]?.price)
            .filter((price) => price !== undefined);
        const fromPrice = firstPrices.length > 0 ? Math.min(...firstPrices) : 0;

        // Check ID city
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(tourData.city);
        if (!isValidObjectId) {
            toast.error("ID thành phố không hợp lệ");
            return;
        }

        const payload = {
            ...tourData,
            fromPrice,
            tickets,
        };

        try {
            const result = await createTour(payload).unwrap();
            toast.success("Tạo tour thành công");
            navigate("/admin/manage-tours");
        } catch (error) {
            toast.error("Tạo tour thất bại. Vui lòng thử lại!");
            console.error(error);
        }
    };

    const [deleteTourImage] = useDeleteImageMutation();

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

    const [uploadImgKey, setUploadImgKey] = useState(0);
    const [images, setImages] = useState([]);
    const [imagesBase64, setImagesBase64] = useState([]);
    const handleImagesChange = async ({ newImages, deletedExisting }) => {
        if (deletedExisting) {
            await deleteImagesFromCloudinary(deletedExisting);
        }
        if (newImages) {
            setImages(newImages);
            setImagesBase64(newImages.map((img) => img.base64));
        }
    };

    const renderStep1 = () => {
        return (
            <div>
                <h2 className="font-semibold text-2xl">Thêm thông tin tour</h2>
                <form onSubmit={handleSubmit(onSubmitTour)}>
                    <div className="bg-white rounded-lg shadow-md mt-6">
                        <h2 className="font-semibold text-lg px-6 py-4 border-b">Thông tin tour</h2>
                        <div className="space-y-4 p-6 overflow-auto">
                            <FormInput
                                label={"Tên tour"}
                                name={"name"}
                                register={register}
                                errors={errors}
                                validationRules={{
                                    required: "Tên là bắt buộc",
                                }}
                                placeholder={"Tên tour"}
                            ></FormInput>

                            <FormInput
                                label={"Địa điểm"}
                                name={"location"}
                                placeholder={"Địa điểm"}
                                register={register}
                                errors={errors}
                                validationRules={{
                                    required: "Địa điểm là bắt buộc",
                                }}
                            ></FormInput>
                            <FormSelect
                                label={"Loại tour"}
                                name={"category"}
                                placeholder={"Chọn loại tour"}
                                validationRules={{
                                    required: "Loại tour là bắt buộc",
                                }}
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
                                    validationRules={{
                                        required: "Thành phố là bắt buộc",
                                    }}
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
                                    validationRules={{
                                        required: "Thời lượng tour là bắt buộc",
                                    }}
                                    className="flex-1"
                                ></FormInput>
                            </div>
                            <TextEditor
                                label={"Trải nghiệm"}
                                name="experiences"
                                placeholder="Nhập các trải nghiệm của tour..."
                                validationRules={{
                                    required: "Trải nghiệm tour là bắt buộc",
                                }}
                                control={control}
                                errors={errors}
                            ></TextEditor>
                            <FormSelect
                                label={"Dịch vụ ngôn ngữ"}
                                name={"languageService"}
                                placeholder={"Chọn dịch vụ ngôn ngữ có sẵn"}
                                validationRules={{
                                    required: "Dịch vụ ngôn ngữ là bắt buộc",
                                }}
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
                                validationRules={{
                                    required: "Lịch trình tour là bắt buộc",
                                }}
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
                    <button className="flex items-center p-2 text-white bg-blue-500 gap-2 rounded mt-6">
                        Tiếp tục thêm vé
                    </button>
                </form>
            </div>
        );
    };

    const renderStep2 = () => (
        <div className="">
            <div className="bg-white rounded-lg shadow-md mt-4">
                <div className="flex items-baseline justify-between px-6 py-4 border-b">
                    <h2 className="font-semibold text-lg text-">Thông tin vé</h2>
                    <button
                        onClick={showModal}
                        className="flex items-center p-2 text-white bg-blue-500 gap-2 rounded"
                    >
                        <HiPlus></HiPlus>
                        Thêm vé
                    </button>
                    <Modal
                        title={<p className="px-5 pb-2 pt-4 text-[18px]">Thêm thông tin vé</p>}
                        open={isTicketModalOpen}
                        onCancel={handleCancel}
                        width={"60%"}
                        footer={null}
                        key={formKey}
                        destroyOnClose
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
                        <TicketForm
                            onAddTicket={(ticket) => {
                                handleAddTicket(ticket);
                                handleCancel();
                            }}
                            onUpdateTicket={(ticket) => {
                                handleUpdateTicket(ticket);
                                handleCancel();
                            }}
                            editingTicket={editingTicket}
                            onCancelEdit={() => {
                                handleCancelEdit();
                                handleCancel();
                            }}
                            useDefaultPolicy={useDefaultPolicy}
                            setUseDefaultPolicy={setUseDefaultPolicy}
                            defaultPolicyValues={defaultPolicy}
                        />
                    </Modal>
                </div>
                <div className="p-6">
                    {tickets.length > 0 ? (
                        <div className="space-y-6">
                            {tickets.map((ticket, index) => (
                                <div key={index} className="border rounded-lg px-4 py-2 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-medium">{ticket.title}</h3>
                                            {ticket.subtitle && (
                                                <p className="text-gray-600">{ticket.subtitle}</p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEditTicket(ticket, index)}
                                                className="text-indigo-600 font-semibold"
                                            >
                                                <CiEdit className="w-6 h-6"></CiEdit>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTicket(index)}
                                                className="text-red-600"
                                            >
                                                <MdOutlineDeleteForever className="w-6 h-6"></MdOutlineDeleteForever>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <div className="space-y-2">
                                            {ticket.prices.map((price, priceIndex) => (
                                                <div
                                                    key={priceIndex}
                                                    className="pl-4 border-l-2 border-indigo-200"
                                                >
                                                    <p>
                                                        <span className="font-medium">
                                                            {price.priceType}:
                                                        </span>{" "}
                                                        {price.price.toLocaleString()} VND
                                                    </p>
                                                    {price.notes && (
                                                        <p className="text-sm text-gray-600">
                                                            Ghi chú: {price.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Cần ít nhất một vé để tạo tour. Vui lòng thêm vé</p>
                    )}
                </div>
            </div>
            <div className="flex gap-4 mt-4">
                <button
                    onClick={() => setStep(1)}
                    className="text-gray-600 bg-white px-6 py-2 rounded border border-1 border-gray-500"
                >
                    Quay lại
                </button>
                <button
                    onClick={() => {
                        if (tickets.length === 0) return alert("Phải có ít nhất 1 vé");
                        console.log(tickets);
                        setStep(3);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Hoàn tất & xem lại
                </button>
            </div>
        </div>
    );

    const uploadToastId = useRef(null);

    useEffect(() => {
        if (isUploadLoading) {
            uploadToastId.current = toast.loading("Đang tải ảnh...");
        } else if (isUploadSuccess) {
            toast.update(uploadToastId.current, {
                render: "Tải ảnh thành công!",
                type: "success",
                isLoading: false,
                closeButton: true,
                autoClose:3000
            });
        } else if (isUploadError) {
            toast.update(uploadToastId.current, {
                render: "Tải ảnh thất bại!",
                type: "error",
                isLoading: false,
                closeButton: true,
                autoClose:3000
            });
        }
    }, [isUploadLoading, isUploadSuccess, isUploadError]);

    const renderStep3 = () => {
        const existingImages = watch("images") || [];

        return (
            <div>
                <h2 className="font-semibold text-2xl">Xác nhận và gửi</h2>
                <div className="bg-white rounded-lg shadow-md mt-4">
                    <div className="p-5">
                        <TourInformation tourData={tourData}></TourInformation>
                        {(existingImages.length > 0 || images.length > 0) && (
                            <div className="mt-2">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-2 h-7 bg-blue-500 rounded"></div>
                                    <h2 className="text-[20px] font-semibold">Ảnh đã chọn</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-4">
                                    {/* Ảnh hiện có */}
                                    {existingImages.map((publicId, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={`${cloudinaryBaseUrl}/${publicId}`}
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

                        <div className="mt-2">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-7 bg-blue-500 rounded"></div>
                                <h2 className="text-[20px] font-semibold">Danh sách vé</h2>
                            </div>
                            <div className="space-y-4 mt-4 pl-5">
                                {tickets.map((ticket, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between px-4 py-2 border rounded-lg"
                                    >
                                        <p className="text-lg font-semibold w-[70%]">
                                            {ticket.title}
                                        </p>
                                        <span className="text-lg font-semibold text-orange-500">
                                            {" "}
                                            {Number(ticket.prices[0].price).toLocaleString("vi-VN")} VND
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => setStep(2)}
                                className="text-gray-600 text-base bg-white px-6 py-2 rounded border border-1 border-gray-500"
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={finishTour}
                                className="bg-blue-600 text-base text-white px-4 py-2 rounded"
                            >
                                Tạo tour
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-softBlue min-h-screen">
            <div className="w-[80%] mx-auto py-6">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </div>
    );
};

export default CreateTour;
