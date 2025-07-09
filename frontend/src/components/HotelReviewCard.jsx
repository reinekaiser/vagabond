import ReviewModal from "./ReviewModal";
import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { FaBuilding } from "react-icons/fa6";
import { CLOUDINARY_BASE_URL } from "../constants/hotel";
import { useAddReviewMutation } from "../redux/api/reviewApiSlice";
import { toast } from "react-toastify";
const HotelReviewCard = ({userId, booking, modalKey, setModalKey, refetch }) => {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const [addReview] = useAddReviewMutation();

    const handleOpenReviewModal = () => {
        setIsReviewModalOpen(true);
        setModalKey((prevKey) => prevKey + 1);
    };
    const handleCloseReviewModal = () => {
        setIsReviewModalOpen(false);
    };

    const handleAddReview = async (review) => {
        const reviewData = {
            userId,
            ...review,
            reviewableId: booking.hotelId._id,
            reviewableType: "Hotel",
            bookingId: booking._id,
        };
        try {
            const res = await addReview(reviewData).unwrap();
            console.log("Review added successfully:", reviewData);
            toast.success("Thêm review thành công")
            refetch()
        } catch (error) {
            console.error("Error adding review:", error);
            toast.error("Thêm review thất bại");
        }
        handleCloseReviewModal();
    };
    return (
        <div className="bg-white rounded-md py-4 px-8 hover:shadow-lg duration-300 flex mb-6">
            <div className="flex items-start mb-4 flex-1">
                <FaBuilding className="text-[18px] mr-2 mt-2 text-blue-400" />
                <div>
                    <p className="font-semibold text-[18px]">
                        {booking.hotelId.name}
                    </p>
                    <p className="text-gray-500 text-sm">
                        {dayjs(booking.checkin).format("DD/MM/YYYY")} -{" "}
                        {dayjs(booking.checkout).format("DD/MM/YYYY")} (
                        {dayjs(booking.checkout).diff(
                            dayjs(booking.checkin),
                            "day"
                        )}{" "}
                        đêm)
                    </p>
                    <p className="text-gray-500 text-sm">
                        {booking.numGuests} khách, {booking.numRooms} phòng
                    </p>
                    <div className="mt-4">
                        <button
                            onClick={() =>
                                handleOpenReviewModal(
                                    booking.hotelId._id,
                                    booking._id,
                                    "Hotel"
                                )
                            }
                            className="text-orange-600 text-[14px] font-medium mt-2 bg-orange-100 border-2 border-orange-400 px-3 py-1 rounded-md hover:bg-orange-200 transition-colors duration-200"
                        >
                            Viết đánh giá
                        </button>
                    </div>

                    <ReviewModal
                        visible={isReviewModalOpen}
                        onCancel={handleCloseReviewModal}
                        onAddReview={handleAddReview}
                        key={modalKey}
                    />
                </div>
            </div>
            <div className="rounded-xl overflow-hidden h-[100px] w-[140px]">
                <img
                    src={`${CLOUDINARY_BASE_URL}/${booking.hotelId.img[0]}`}
                    alt=""
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default HotelReviewCard;
