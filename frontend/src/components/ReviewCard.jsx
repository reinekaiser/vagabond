import React, { useState } from 'react'
import { Drawer } from 'antd'
import { useGetReviewByProductIdQuery } from '../redux/api/reviewApiSlice'
import { CLOUDINARY_BASE_URL } from '../constants/hotel'
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import dayjs from "dayjs";

const ReviewCard = ({ hotelId, type }) => {
    const { data, isLoading } = useGetReviewByProductIdQuery({
        reviewableId: hotelId,
        reviewableType: type
    })

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [expandedComments, setExpandedComments] = useState({});

    if (isLoading) return <div>Loading...</div>

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    }
    const toggleExpandComment = (reviewId) => {
        setExpandedComments(prev => ({
            ...prev,
            [reviewId]: !prev[reviewId]
        }));
    }

    const hasReviews = data?.reviews?.length > 0;
    const firstReview = hasReviews ? data.reviews[0] : null;
    const user = firstReview?.userId;

    if (!hasReviews) {
        return (
            <div className="text-center py-6 text-gray-500 text-sm">
                Khách sạn này chưa có đánh giá nào. Hãy để lại đánh giá sau khi đặt!
            </div>
        );
    }

    return (
        <>
            <div
                className="cursor-pointer"
                onClick={() => setDrawerVisible(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setDrawerVisible(true) }}
            >
                <div className='flex items-center mb-3'>
                    <div>
                        <span className='text-5xl'>{data?.averageRating?.toFixed(1) || "0.0"}</span>
                        <span className='text-[18px] text-gray-500'>/5</span>
                    </div>
                    <div className='ml-4'>
                        <p className="text-sm text-gray-700 font-semibold ml-[2px]">
                            {data.averageRating >= 4
                                ? "Tuyệt vời"
                                : data.averageRating >= 3
                                    ? "Rất Tốt"
                                    : "Trung bình"}
                        </p>
                        <p className='text-sm underline'>{data.reviews.length} Bình luận</p>
                    </div>
                </div>

                <div className='flex items-start gap-3'>
                    <div className={`w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0`}>
                        {user?.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-white text-sm font-semibold">
                                {getInitials(user?.firstName, user?.lastName)}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className='text-[14px] font-semibold'>
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className='text-[14px] font-light text-gray-500'>
                            {firstReview?.comment?.length > 90
                                ? firstReview.comment.slice(0, 90) + '...'
                                : firstReview?.comment || "Không có bình luận"}
                        </p>
                    </div>
                </div>
            </div>

            <Drawer
                title={`Tất cả đánh giá`}
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={550}
            >
                <div className=''>
                    <div className='flex items-center mb-6'>
                        <div>
                            <span className='text-6xl font-medium'>{data?.averageRating?.toFixed(1) || "0.0"}</span>
                            <span className='text-[20px] text-gray-500'>/5</span>
                        </div>
                        <div className='ml-4 flex items-center'>
                            <p className="text-[16px] text-gray-700 font-medium ml-[2px]">
                                {data.averageRating >= 4
                                    ? "Tuyệt vời"
                                    : data.averageRating >= 3
                                        ? "Rất Tốt"
                                        : "Trung bình"}
                            </p>
                            <p className='text-[16px] text-gray-500 ml-3'>{data.reviews.length} Bình luận</p>
                        </div>
                    </div>
                    {data.reviews.map((review) => {
                        const reviewer = review.userId
                        const date = new Date(review.createdAt).toLocaleDateString()
                        const isExpanded = expandedComments[review._id];
                        const comment = review.comment || "Không có bình luận";
                        const shouldShowToggle = comment.length > 150;
                        return (
                            <div key={review._id} className="mb-6 border-t border-gray-200 pt-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                                        {reviewer?.profilePicture ? (
                                            <img
                                                src={reviewer.profilePicture}
                                                alt={`${reviewer.firstName} ${reviewer.lastName}`}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white text-sm font-semibold">
                                                {getInitials(reviewer?.firstName, reviewer?.lastName)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{reviewer?.firstName} {reviewer?.lastName}</p>
                                        <p className="text-xs text-gray-400">{date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-yellow-500 mb-2 text-lg">
                                    {Array.from({ length: Math.floor(review.rating) }).map((_, i) => (
                                        <FaStar key={`full-${i}`} />
                                    ))}
                                    {review.rating % 1 === 0.5 && <FaStarHalfAlt key="half" />}
                                    {Array.from({
                                        length:
                                            5 -
                                            Math.floor(review.rating) -
                                            (review.rating % 1 === 0.5 ? 1 : 0),
                                    }).map((_, i) => (
                                        <FaRegStar key={`empty-${i}`} />
                                    ))}
                                </div>
                                <p className="text-gray-700 text-sm mb-1">
                                    {shouldShowToggle && !isExpanded
                                        ? comment.slice(0, 150) + '...'
                                        : comment
                                    }
                                </p>
                                {shouldShowToggle && (
                                    <button
                                        className="text-blue-600 text-xs font-medium underline cursor-pointer"
                                        onClick={() => toggleExpandComment(review._id)}
                                    >
                                        {isExpanded ? "Thu gọn" : "Xem thêm"}
                                    </button>
                                )}

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
                        )
                    })}
                </div>

            </Drawer>
        </>
    )
}

export default ReviewCard