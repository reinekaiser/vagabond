import { useNavigate, useParams } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import TourInformation from "../../components/TourInformation";
import {
    useAddTicketToTourMutation,
    useDeleteTicketFromTourMutation,
    useGetTourDetailsQuery,
} from "../../redux/api/tourApiSlice";
import { CiEdit } from "react-icons/ci";
import { MdOutlineDeleteForever } from "react-icons/md";
import { Modal } from "antd";
import { toast } from "react-toastify";
import { useState } from "react";
import TicketForm from "../../components/TicketForm";
import TicketEditModal from "../../components/TicketEditModal";
import TourEditModal from "../../components/TourEditModal";

const TourDetailsAdmin = () => {
    const params = useParams();
    const navigate = useNavigate();
    const { data, isLoading, refetch } = useGetTourDetailsQuery(params._id);

    const [addTicketToTour, { isLoading: isLoadingAddTicket, isSuccess }] =
        useAddTicketToTourMutation();

    const handleAddTicketToTour = async (ticketData) => {
        try {
            const tourId = data.tour._id;
            await addTicketToTour({ tourId, ticketData }).unwrap();
            toast.success("Thêm vé thành công");
            refetch();
        } catch (err) {
            toast.error("Thêm vé thất bại. Vui lòng thử lại!");
            console.error("Thêm vé thất bại:", err);
        }
    };

    const [isAddTicketModalOpen, setIsAddTicketModalOpen] = useState(false);

    const handleCancel = () => {
        setIsAddTicketModalOpen(false);
    };

    const [editTicket, setEditTicket] = useState(null);
    const [formKey, setFormKey] = useState(0);

    const showModal = () => {
        setEditTicket(null);
        setIsAddTicketModalOpen(true);
        setFormKey((prev) => prev + 1);
    };

    const TicketCard = ({ ticket }) => {
        const [isUpdateTicketModalOpen, setIsUpdateTicketModalOpen] = useState(false);

        const handleCancelUpdateTicketModal = () => {
            setIsUpdateTicketModalOpen(false);
        };

        const [deleteTicketFromTour, { isLoading: isLoadingDeleteTicket }] =
            useDeleteTicketFromTourMutation();

        const [isViewModalOpen, setIsViewModalOpen] = useState(false);
        const showViewModal = () => {
            setIsViewModalOpen(true);
        };

        const handleCancelViewModal = () => {
            setIsViewModalOpen(false);
        };

        const [isDeleteTicketModalOpen, setIsDeleteTicketModalOpen] = useState(false);

        const handleDeleteTicketFromTour = async () => {
            try {
                const tourId = data.tour._id;
                const ticketId = ticket._id;
                console.log(ticketId);
                await deleteTicketFromTour({
                    tourId,
                    ticketId,
                }).unwrap();
                toast.success("Xóa vé thành công");
                refetch();
            } catch (error) {
                toast.error("Xóa vé thất bại. Vui lòng thử lại!");
                console.error("Xóa vé thất bại:", error);
            }
        };

        return (
            <div className="flex justify-between items-start px-4 py-2 border rounded-lg">
                <div>
                    <p className="text-lg font-semibold w-[70%]">{ticket.title}</p>
                    <p
                        onClick={showViewModal}
                        className="text-blue-500 font-semibold mt-2 cursor-pointer"
                    >
                        Xem chi tiết
                    </p>
                    <Modal
                        title={
                            <div className="font-semibold text-xl w-[650px] px-4 pt-2">{ticket.title}</div>
                        }
                        open={isViewModalOpen}
                        onCancel={handleCancelViewModal}
                        footer={null}
                        width={750}
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
                        <div className="p-4 h-[500px] overflow-auto">
                            <p className=" text-gray-500">{ticket.description}</p>
                            <div className="mt-4">
                                <p className="text-xl font-bold">Tổng quan</p>
                                <div
                                    className="dot ticket-overview px-3"
                                    dangerouslySetInnerHTML={{
                                        __html: ticket.overview,
                                    }}
                                />
                            </div>
                            <div className="mt-4">
                                <p className="text-xl font-bold">Các loại giá vé</p>
                                <div className="mt-2 space-y-2">
                                    {ticket.prices.map((p, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between px-2 py-2 border rounded-lg"
                                        >
                                            <div>
                                                <p className="text-lg ">{p.priceType}</p>
                                                {p.notes && (
                                                    <p className="text-gray-500">{p.notes}</p>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-orange-400">
                                                    {p.price.toLocaleString("vi-VN")} VND
                                                </p>
                                                <div className="flex gap-2 font-normal">
                                                    <p>Số lượng đặt tối thiểu: {p.minPerBooking}</p>
                                                    <p>Số lượng đặt tối đa: {p.maxPerBooking}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-xl font-bold">Hiệu lực vourcher</p>
                                <ul className="px-3 mt-2">
                                    {ticket.voucherValidity.split("\n").map((v, index) => (
                                        <li key={index} className="flex gap-3">
                                            <span className="w-[7px] h-[7px] rounded-full bg-[#1f1f1f] mt-[10px]"></span>
                                            {v}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-4">
                                <p className="text-xl font-bold mb-3">Phương thức quy đổi</p>
                                <div className="border-t-[1.5px] border-dashed">
                                    <p className="text-xl font-bold mt-3">Cách đổi phiếu</p>
                                    <div
                                        className="dot ticket-details px-3 mt-2 font-semibold"
                                        dangerouslySetInnerHTML={{
                                            __html: ticket.redemptionPolicy.method,
                                        }}
                                    />
                                </div>
                                {ticket.redemptionPolicy.location && (
                                    <div className="border-t-[1.5px] border-dashed">
                                        <p className="text-xl font-bold mt-3">Nơi đổi phiếu</p>
                                        <div
                                            className="dot ticket-details px-3 mt-2 font-semibold"
                                            dangerouslySetInnerHTML={{
                                                __html: ticket.redemptionPolicy.location,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <p className="text-xl font-bold">Hoàn tiền và đổi lịch</p>
                                <div className="px-3 mt-2 mb-3">
                                    {ticket.cancellationPolicy.isReschedule ? (
                                        <p>Có thể đổi lịch</p>
                                    ) : (
                                        <p>Không thể đổi lịch</p>
                                    )}
                                    {ticket.cancellationPolicy.isRefund ? (
                                        <p>Chỉ có thể yêu cầu xử lý hoàn tiền trước ngày chọn.</p>
                                    ) : (
                                        <p>Không thể đổi lịch</p>
                                    )}
                                </div>
                                {ticket.cancellationPolicy.reschedulePolicy && (
                                    <div className="border-t-[1.5px] border-dashed">
                                        <p className="text-xl font-bold mt-3">
                                            Chính sách đổi lịch
                                        </p>
                                        <p>{ticket.cancellationPolicy.reschedulePolicy}</p>
                                    </div>
                                )}
                                {ticket.cancellationPolicy.isRefund && (
                                    <div className="border-t-[1.5px] border-dashed">
                                        <p className="text-xl font-bold mt-2">
                                            Chính sách hoàn tiền
                                        </p>
                                        <ul className="px-3 mt-2">
                                            <li className="">
                                                <div className="flex gap-3">
                                                    <span className="w-[7px] h-[7px] rounded-full bg-[#1f1f1f] mt-[10px] flex-grow-0 flex-shrink-0"></span>
                                                    Yêu cầu hoàn tiền muộn nhất là
                                                </div>
                                                <ul className="ml-4">
                                                    {ticket.cancellationPolicy.refundPolicy.refundPercentage.map(
                                                        (r) => (
                                                            <li>
                                                                <div className="flex gap-3">
                                                                    <span className="w-[7px] h-[7px] rounded-full bg-[#1f1f1f] mt-[10px] flex-grow-0 flex-shrink-0"></span>
                                                                    {r.daysBefore} ngày trước ngày
                                                                    đi đã chọn của bạn để nhận được{" "}
                                                                    {r.percent}% hoàn tiền
                                                                </div>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </li>
                                            {ticket.cancellationPolicy.refundPolicy.description
                                                .split("\n")
                                                .map((r, index) => (
                                                    <li key={index} className="flex gap-3">
                                                        <span className="w-[7px] h-[7px] rounded-full bg-[#1f1f1f] mt-[10px] flex-grow-0 flex-shrink-0"></span>
                                                        {r}
                                                    </li>
                                                ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <p className="text-xl font-bold">Điều khoản & Điều kiện</p>
                                <div
                                    className="dot ticket-overview px-3"
                                    dangerouslySetInnerHTML={{
                                        __html: ticket.termsAndConditions,
                                    }}
                                />
                            </div>
                        </div>
                    </Modal>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            setIsUpdateTicketModalOpen(true);
                        }}
                        className="text-indigo-600 font-semibold"
                    >
                        <CiEdit className="w-6 h-6"></CiEdit>
                    </button>
                    <TicketEditModal
                        open={isUpdateTicketModalOpen}
                        onCancel={handleCancelUpdateTicketModal}
                        ticket={ticket}
                        tourId={data.tour._id}
                        refetch={refetch}
                    ></TicketEditModal>
                    <button
                        className="text-red-600"
                        onClick={() => setIsDeleteTicketModalOpen(true)}
                    >
                        <MdOutlineDeleteForever className="w-6 h-6"></MdOutlineDeleteForever>
                    </button>
                    <Modal
                        title="Xác nhận xóa tour"
                        open={isDeleteTicketModalOpen}
                        onOk={handleDeleteTicketFromTour}
                        onCancel={() => setIsDeleteTicketModalOpen(false)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{
                            danger: true,
                            loading: isLoadingDeleteTicket,
                        }}
                    >
                        <p>Bạn có chắc chắn muốn xoá vé này không?</p>
                    </Modal>
                </div>
            </div>
        );
    };

    const [isTourEditModalOpen, setIsTourEditModalOpen] = useState(false);

    if (isLoading) return <div>Loading...</div>;

    const { voucherValidity, redemptionPolicy, cancellationPolicy, termsAndConditions } =
        data.tickets[0];
    const defaultPolicy = {
        voucherValidity,
        redemptionPolicy,
        cancellationPolicy,
        termsAndConditions,
    };

    return (
        <div className="bg-softBlue min-h-screen p-4 md:p-8">
            <div className="w-[85%] mx-auto mt-4">
                <div className="flex items-center">
                    <button
                        className="flex items-center text-[18px] font-semibold hover:bg-gray-200 px-2 py-1 rounded-md duration-300"
                        onClick={() => navigate("/admin/manage-tours")}
                    >
                        <FaAngleLeft className="mr-3" />
                        Quay lại
                    </button>
                    <div
                        className="flex items-center ml-auto bg-blue-500 text-white py-1 px-2 rounded-lg text-[18px] font-medium cursor-pointer duration-300"
                        onClick={() => setIsTourEditModalOpen(true)}
                    >
                        <MdEdit className="mr-2" />
                        Sửa tour
                    </div>
                    <TourEditModal
                        open={isTourEditModalOpen}
                        tour={data.tour}
                        onCancel={() => setIsTourEditModalOpen(false)}
                        refetch={refetch}
                    ></TourEditModal>
                </div>
            </div>
            <div className="w-[85%] mx-auto bg-white rounded-lg shadow-md mt-4 p-4 md:p-6">
                <TourInformation tourData={data.tour}></TourInformation>
                <div className="mt-2">
                    <div className="flex justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-7 bg-blue-500 rounded"></div>
                            <h2 className="text-[20px] font-semibold">Danh sách vé</h2>
                        </div>
                        <button
                            onClick={showModal}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg"
                        >
                            Thêm vé
                        </button>
                        <Modal
                            title={<p className="px-5 pb-2 pt-4 text-[18px]">Thêm vé</p>}
                            open={isAddTicketModalOpen}
                            onCancel={handleCancel}
                            width={"60%"}
                            footer={null}
                            key={formKey}
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
                                onAddTicket={(ticketData) => {
                                    handleAddTicketToTour(ticketData);
                                    handleCancel();
                                }}
                                onUpdateTicket={(ticketData) => {
                                    console.log("edit in form", ticketData);
                                    handleUpdateTicket(ticketData);
                                    handleCancel();
                                }}
                                editingTicket={editTicket}
                                onCancelEdit={() => {
                                    setEditTicket(null);
                                    handleCancel();
                                }}
                                defaultPolicyValues={defaultPolicy}
                            />
                        </Modal>
                    </div>
                    <div className="space-y-4 mt-4 pl-5">
                        {data.tickets.map((ticket, index) => (
                            <TicketCard key={index} ticket={ticket}></TicketCard>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourDetailsAdmin;
