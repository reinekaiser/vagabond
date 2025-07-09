import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    useAddReviewMutation,
    useDeleteReviewMutation,
    useGetHotelBookingCanReviewQuery,
    useGetMyReviewsQuery,
    useGetTourBookingCanReviewQuery,
    useUpdateReviewMutation,
} from "../../redux/api/reviewApiSlice";
import { Tabs, message, Modal } from "antd";
import { FaRegCommentDots } from "react-icons/fa";
import { CLOUDINARY_BASE_URL } from "../../constants/hotel";
import dayjs from "dayjs";
import { FaBuilding } from "react-icons/fa6";
import ReviewModal from "../../components/ReviewModal";
import { toast } from "react-toastify";
import { IoTicketSharp } from "react-icons/io5";
import {
    FaStar,
    FaRegStar,
    FaStarHalfAlt,
    FaEdit,
    FaTrash,
} from "react-icons/fa";
import HotelReviewCard from "../../components/HotelReviewCard";
import TourReviewCard from "../../components/TourReviewCard";

const UnreviewedTab = () => {
    const { user } = useSelector((state) => state.auth);

    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [modalKey, setModalKey] = useState(0);
    const [itemId, setItemId] = useState(null);
    const [bookingId, setBookingId] = useState(null);
    const [type, setType] = useState(null);

    const {
        data: hotelBookings,
        isLoading: isHotelBookingLoading,
        refetch: refetchHotel,
    } = useGetHotelBookingCanReviewQuery(user._id);
    const {
        data: tourBookings,
        isLoading: isTourBookingLoading,
        refetch: refetchTour,
    } = useGetTourBookingCanReviewQuery(user._id);
    const [addReview] = useAddReviewMutation();

    if (isHotelBookingLoading || isTourBookingLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="w-10 h-10 border-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Đơn khách sạn
            </h2>
            {hotelBookings?.length === 0 ? (
                <p className="text-center text-gray-500 mb-4">
                    Không có đơn khách sạn nào có thể đánh giá.
                </p>
            ) : (
                hotelBookings.map((booking, index) => (
                    <HotelReviewCard
                        userId={user._id}
                        booking={booking}
                        modalKey={modalKey}
                        setModalKey={setModalKey}
                        refetch={refetchHotel}
                    ></HotelReviewCard>
                ))
            )}

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Đơn tour
            </h2>
            {tourBookings?.length === 0 ? (
                <p className="text-center text-gray-500">
                    Không có đơn tour nào có thể đánh giá.
                </p>
            ) : (
                tourBookings.map((booking, index) => (
                    <TourReviewCard
                        userId={user._id}
                        booking={booking}
                        modalKey={modalKey}
                        setModalKey={setModalKey}
                        refetch={refetchTour}
                    ></TourReviewCard>
                ))
            )}
        </div>
    );
};

const ReviewedTab = () => {
    const [messageApi, contextMessageHolder] = message.useMessage();
    const { user } = useSelector((state) => state.auth);
    const {
        data: myReviews,
        isLoading: isReviewsLoading,
        refetch,
    } = useGetMyReviewsQuery(user._id);

    const ReviewCard = ({ review }) => {
        const [updateReview] = useUpdateReviewMutation();
        const [deleteReview, { isLoading: isDeleting, isSuccess }] =
            useDeleteReviewMutation();

        const [editingReview, setEditingReview] = useState(null);
        const [editingReviewId, setEditingReviewId] = useState(null);
        const [isEditModalOpen, setIsEditModalOpen] = useState(false);
        const [modalKey, setModalKey] = useState(0);

        const handleOpenEditModal = (editingReview, editingReviewId) => {
            setEditingReview(editingReview);
            setEditingReviewId(editingReviewId);
            setModalKey((prevKey) => prevKey + 1);
            setIsEditModalOpen(true);
        };

        const handleCloseModal = () => {
            setEditingReview(null);
            setEditingReviewId(null);
            setIsEditModalOpen(false);
        };

        const handleUpdateReview = async (updatedReview) => {
            try {
                const res = await updateReview({
                    id: editingReviewId,
                    review: updatedReview,
                }).unwrap();
                toast.success("Cập nhật đánh giá thành công");
                console.log("Review updated successfully:", res);
                refetch();
            } catch (error) {
                console.error("Error updating review:", error);
                toast.error("Cập nhật đánh giá thất bại");
            }
            handleCloseModal();
        };

        const [isDeleteReviewModalVisible, setDeleteReviewModalVisible] = useState(false);
        const [selectedReviewId, setSelectedReviewId] = useState(null);
        const showDeleteReviewModal = (reviewId) => {
            setSelectedReviewId(reviewId);
            setDeleteReviewModalVisible(true);
        };
        const confirmDeleteReview = async () => {
            try {
                const res = await deleteReview(selectedReviewId).unwrap();
                console.log("Review deleted successfully:", res);
                toast.success("Xoá đánh giá thành công");
                refetch();
            } catch (error) {
                console.error("Error deleting review:", error);
                toast.error("Xoá đánh giá thất bại");
            } finally {
                setDeleteReviewModalVisible(false);
                setSelectedReviewId(null);
            }
        };

        useEffect(() => {
            if (isDeleting) {
                messageApi.open({
                    key: "deleting",
                    type: "loading",
                    content: "Đang xoá...",
                    duration: 0,
                });
            }
            if (isSuccess) {
                messageApi.destroy("deleting");
            }
        }, [isDeleting, isSuccess]);

        return (
            <div className="bg-white shadow-md rounded-md p-5 flex flex-col sm:flex-row justify-between gap-4 relative">
                <div className="absolute top-4 right-4 flex gap-3 text-gray-500">
                    <button
                        onClick={() => handleOpenEditModal(review, review._id)}
                        className="hover:text-blue-500 transition-colors"
                    >
                        <FaEdit className="text-[16px]" />
                    </button>
                    <button
                        onClick={() => showDeleteReviewModal(review._id)}
                        className="hover:text-red-500 transition-colors"
                    >
                        <FaTrash />
                    </button>

                    <ReviewModal
                        visible={isEditModalOpen}
                        onCancel={handleCloseModal}
                        onUpdateReview={handleUpdateReview}
                        editingReview={editingReview}
                        key={modalKey}
                    />
                    <Modal
                        title="Xác nhận xoá đánh giá"
                        open={isDeleteReviewModalVisible}
                        onOk={confirmDeleteReview}
                        onCancel={() => setDeleteReviewModalVisible(false)}
                        okText="Xoá"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <p>Bạn có chắc chắn muốn xoá đánh giá này?</p>
                    </Modal>
                </div>

                <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                        {review.reviewableId?.name}
                    </h3>

                    <div className="flex items-center text-yellow-500 mb-1">
                        {Array.from({
                            length: Math.floor(review.rating),
                        }).map((_, i) => (
                            <FaStar key={`full-${i}`} />
                        ))}
                        {review.rating % 1 === 0.5 && (
                            <FaStarHalfAlt key="half" />
                        )}
                        {Array.from({
                            length:
                                5 -
                                Math.floor(review.rating) -
                                (review.rating % 1 === 0.5 ? 1 : 0),
                        }).map((_, i) => (
                            <FaRegStar key={`empty-${i}`} />
                        ))}
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold text-orange-500 text-[15px]">
                            {Number(review.rating).toFixed(1)}
                        </span>{" "}
                        /5.0 –
                        {review.rating >= 4
                            ? "Tuyệt vời"
                            : review.rating >= 3
                                ? "Tốt"
                                : "Trung bình"}
                    </p>

                    <p className="text-gray-600 text-[16px]">
                        {review.comment}
                    </p>

                    {review.images.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {review.images.slice(0, 3).map((img, idx) => (
                                <img
                                    key={idx}
                                    src={`${CLOUDINARY_BASE_URL}/${img}`}
                                    alt={`review-img-${idx}`}
                                    className="w-24 h-24 object-cover rounded-md"
                                />
                            ))}
                            {review.images.length > 3 && (
                                <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center text-gray-600 text-sm font-medium">
                                    +{review.images.length - 3}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="text-sm text-gray-400 mt-3">
                        {review.reviewableType} | Đánh giá vào{" "}
                        {dayjs(review.createdAt).format("DD/MM/YYYY")}
                    </div>
                </div>
            </div>
        );
    };

    if (isReviewsLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="w-10 h-10 border-2 border-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!myReviews || myReviews.length === 0) {
        return (
            <div className="text-center text-gray-500 mt-6">
                Bạn chưa có đánh giá nào.
            </div>
        );
    }

    console.log(myReviews);
    return (
        <div className="space-y-4">
            {contextMessageHolder}
            {myReviews.map((review) => (
                <ReviewCard review={review}></ReviewCard>
            ))}
        </div>
    );
};

const MyReviews = () => {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <div className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <FaRegCommentDots className="w-7 h-7 text-blue-500" />
                        Đánh giá
                    </h2>
                    <Tabs
                        defaultActiveKey="hotel"
                        tabBarGutter={32}
                        type="line"
                        size="large"
                        className="px-4 rounded-lg"
                        items={[
                            {
                                key: "unreviewed",
                                label: "Thêm đánh giá",
                                children: <UnreviewedTab />,
                            },
                            {
                                key: "reviewed",
                                label: "Đã đánh giá",
                                children: <ReviewedTab />,
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default MyReviews;
