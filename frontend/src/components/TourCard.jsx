import { IoIosStar } from "react-icons/io";

import { useNavigate, Link } from "react-router-dom";
import { CLOUDINARY_BASE_URL } from "../constants/hotel";
import { CATEGORY_OPTIONS } from "../constants/tour";

const TourCard = ({ tour }) => {

    return (
        <Link
            to={`/tour/${tour._id}`}
            className="cursor-pointer"
        >
            <div className="rounded-xl border h-[350px] flex flex-col shadow-md overflow-hidden">
                <div className="h-[200px] relative flex-1">
                    <img
                        src={`${CLOUDINARY_BASE_URL}/${tour.images[0]}`}
                        className="w-full h-full object-cover rounded-t-xl"
                        alt={tour.name}
                    ></img>
                    <div className="px-2 py-1 absolute bg-[#ff6d70] text-white font-bold top-0 rounded-br-lg">
                        {tour.location.split(",")[0].trim()}
                    </div>
                </div>
                <div className="px-4 py-2 flex flex-col flex-1">
                    <h3 className="text font-semibold pr-1 line-clamp-2">{tour.name}</h3>
                    <div className="flex gap-2">
                        {tour.category.slice(0, 2).map((cate, key) => (
                            <span
                                key={key}
                                className="text-[12px] px-1 bg-gray-100 text-gray_primary font-light"
                            >
                                {
                                    CATEGORY_OPTIONS.find(
                                        (options) => options.value == cate
                                    ).label
                                }
                            </span>
                        ))}
                    </div>
                    <div className="mt-[6px] text-gray_primary flex gap-2">
                        <div className="flex gap-1">
                            <div className="text-blue-600 flex items-center gap-1">
                                <IoIosStar></IoIosStar>
                                {tour.avgRating || 4.2}
                            </div>
                        </div>
                        - <span>{tour.bookings || 10} đã được bán</span>
                    </div>
                    <p className="mt-auto text-lg font-semibold text-orange_primary">
                        {tour.fromPrice.toLocaleString("vi-VN")} VND
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default TourCard;
