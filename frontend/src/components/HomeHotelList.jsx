import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiOutlineExternalLink } from "react-icons/hi";
import GeneralCarousel from "./GeneralCarousel";
import { useGetHotelsQuery } from "../redux/api/hotelApiSlice";
import { CLOUDINARY_BASE_URL } from "../constants/hotel";
import dayjs from "dayjs";

const HomeHotelList = () => {
    const navigate = useNavigate();
    const responsive = {
        desktop: {
            breakpoint: {
                max: 3000,
                min: 1024,
            },
            items: 4,
        },
        mobile: {
            breakpoint: {
                max: 464,
                min: 0,
            },
            items: 2,
        },
        tablet: {
            breakpoint: {
                max: 1024,
                min: 464,
            },
            items: 3,
        },
    };

    function HotelCard({ hotel }) {
        const allPrices = hotel.roomTypes.flatMap((item) =>
            item.rooms.map((child) => child.price)
        );

        const minPrice = Math.min(...allPrices);

        return (
            <div
                onClick={() => {
                    const today = dayjs().format("DD/MM/YYYY");
                    const tomorrow = dayjs().add(1, 'day').format("DD/MM/YYYY");
                    navigate(`/hotels/${hotel._id}?location=${hotel.city.name}&checkIn=${today}&checkOut=${tomorrow}`);
                }}
                className="cursor-pointer"
            >
                <div className="rounded-xl border h-[320px] flex flex-col shadow-md">
                    <div className="h-[200px] rounded rounded-t-xl relative">
                        <img
                            src={`${CLOUDINARY_BASE_URL}/${hotel.img[0]}`}
                            className="w-full h-full object-cover rounded-t-xl"
                            alt={hotel.name}
                        ></img>
                    </div>
                    <div className="px-4 py-2 flex flex-col flex-1">
                        <h3 className="text-md font-semibold pr-1 line-clamp-1">
                            {hotel.name}
                        </h3>
                        <div className="flex gap-1 text-yellow-400">
                            {Array(Math.round(hotel.averageRating || 4.2))
                                .fill(1)
                                .map((_, index) => (
                                    <FaStar
                                        key={index}
                                        className="w-3 h-3"
                                    ></FaStar>
                                ))}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 mt-1">
                            <span className="px-2 inline-flex items-baseline text-white bg-blue-500 rounded-tl-lg rounded-br-lg rounded-tr-sm rounded-bl-sm">
                                <span className="text-md inline-block align-baseline">
                                    {hotel.averageRating || 4.2}
                                </span>
                                <span>/5</span>
                            </span>
                        </div>
                        <p className="text-lg text-orange-500 font-semibold mt-auto">
                            {minPrice.toLocaleString("vi-vn")} VND
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const { data: hotel, refetch, isLoading } = useGetHotelsQuery({ limit: 6 });

    if (isLoading) {
        return <div></div>;
    }
    const allhotels = [...hotel.data, ...hotel.data];

    return (
        <section className="mt-16 container mx-auto">
            <div className="flex items-center gap-4 justify-center">
                <img src="/icons/hotel.webp" className="w-7 h-7"></img>
                <h2 className="font-bold text-2xl">
                    Đa dạng lựa chọn khách sạn
                </h2>
            </div>
            <div className="container mx-auto relative mt-4">
                <GeneralCarousel responsive={responsive}>
                    {allhotels.slice(0, 6).map((hotel, key) => (
                        <HotelCard hotel={hotel} key={key}></HotelCard>
                    ))}
                </GeneralCarousel>
            </div>
            <div className="text-center mt-6">
                <div
                    onClick={() => navigate("/hotels")}
                    className="inline-flex gap-2 items-center cursor-pointer px-8 py-2 border border-gray-500 rounded-md"                   
                >
                    <span className="font-semibold">Đặt khách sạn ngay</span>
                    <HiOutlineExternalLink className="h-5 w-5"></HiOutlineExternalLink>
                </div>
            </div>
        </section>
    );
};

export default HomeHotelList;
