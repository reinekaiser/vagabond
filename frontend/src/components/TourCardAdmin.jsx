import { Dropdown, Modal } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa6";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaLocationDot } from "react-icons/fa6";
import { FaUserGroup } from "react-icons/fa6";
import {
    useDeleteTourMutation,
    useGetToursQuery,
} from "../redux/api/tourApiSlice";
import { TbEyeEdit } from "react-icons/tb";
import { MdDeleteForever } from "react-icons/md";
import { CLOUDINARY_BASE_URL } from "../constants/hotel";
const TourCardAdmin = ({ tour }) => {
    const navigate = useNavigate();
    const menuActions = [
        {
            key: "1",
            label: (
                <div
                    className="flex items-center w-[130px]"
                    onClick={() =>
                        navigate(`/admin/manage-tours/tour-detail/${tour._id}`)
                    }
                >
                    <TbEyeEdit className="text-[20px] mr-2" />
                    Xem và sửa
                </div>
            ),
        },
        {
            key: "2",
            label: (
                <div
                    className="flex items-center w-[100px] text-red-500"
                    onClick={() => setIsDeleteModalOpen(true)}
                >
                    <MdDeleteForever className="text-[20px] mr-2" />
                    Xoá
                </div>
            ),
        },
    ];

    const tourImages = tour.images?.map(img => {
        return img ? `${CLOUDINARY_BASE_URL}/${img}` : null
    })

    const { refetch } = useGetToursQuery();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTour, { isLoading }] = useDeleteTourMutation();

    const handleDeleteTour = async () => {
        try {
            await deleteTour(tour._id).unwrap();
            refetch();
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Lỗi khi xoá tour:", error);
        }
    };

    return (
        <div className="bg-white p-2 rounded-md relative shadow-md border flex flex-col border-gray-100">
            <div className="h-[168px] flex gap-1 relative">
                <img
                    src={
                        tourImages[0] ||
                        "https://placehold.co/600x400?text=Hello+World"
                    }
                    alt=""
                    className="w-[65%] h-full object-cover rounded-lg"
                />
                <div className="absolute top-2 right-[37%] bg-yellow-200 text-yellow-400  font-semibold text-sm px-2 py-0.5 rounded-md shadow flex items-center">
                    <FaStar />
                    <span className="ml-[2px] text-gray-800 text-sm">
                        {tour.avgRating || 4.2}
                    </span>
                </div>
                <div className="flex flex-col h-full gap-1">
                    <img
                        src={
                            tourImages[1] ||
                            "https://placehold.co/600x400?text=Hello+World"
                        }
                        alt=""
                        className="object-cover flex-1 rounded-lg"
                    />
                    <img
                        src={
                            tourImages[2] ||
                            "https://placehold.co/600x400?text=Hello+World"
                        }
                        alt=""
                        className="object-cover flex-1 rounded-lg"
                    />
                </div>
            </div>
            <div className="p-2 flex flex-1 gap-1 flex-col">
                <p className="text-gray-500 text-xs">
                    Ngày tạo: {new Date(tour.createdAt).toLocaleString()}
                </p>

                <h2 className="text-base font-semibold text-gray-800 line-clamp-2">
                    {tour.name}
                </h2>
                <div className="flex items-center gap-1">
                    <FaLocationDot className="text-red-500 w-4 h-4"></FaLocationDot>
                    <span className="text-sm line-clamp-1">{tour.location}</span>
                </div>

                <div className="flex items-center gap-1">
                    <FaUserGroup className="text-green-500 w-4 h-4"></FaUserGroup>
                    <span className="text-sm">{tour.bookings || 0} đặt vé</span>
                </div>
                <div className="text-orange-400 text-base font-semibold mt-auto">
                    {tour.fromPrice.toLocaleString("vi-VN")} VND
                </div>
            </div>

            <Dropdown
                menu={{ items: menuActions }}
                placement="topRight"
                arrow
                dropdownRender={(menu) => React.cloneElement(menu)}
                trigger={["click"]}
            >
                <div className="absolute bottom-3 right-[8px] p-2 rounded-full hover:bg-gray-100 cursor-pointer">
                    <BsThreeDotsVertical className="text-gray-400 w-4 h-4"></BsThreeDotsVertical>
                </div>
            </Dropdown>
            <Modal
                title="Xác nhận xóa tour"
                open={isDeleteModalOpen}
                onOk={handleDeleteTour}
                onCancel={() => setIsDeleteModalOpen(false)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true, loading: isLoading }}
            >
                <p>Bạn có chắc chắn muốn xoá tour này không?</p>
            </Modal>
        </div>
    );
};

export default TourCardAdmin;
