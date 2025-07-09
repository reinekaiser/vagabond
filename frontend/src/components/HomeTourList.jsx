import { IoIosStar } from "react-icons/io";
import { HiOutlineExternalLink } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import GeneralCarousel from "./GeneralCarousel";
import { useGetToursQuery } from "../redux/api/tourApiSlice";
import { CLOUDINARY_BASE_URL } from "../constants/hotel";
import { CATEGORY_OPTIONS } from "../constants/tour";
import TourCard from "./TourCard";
const HomeTourList = () => {
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


    const { data: tours, refetch, isLoading } = useGetToursQuery({ });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const allTour = [...tours.data, ...tours.data];
    return (
        <section className="mt-16 container mx-auto">
            <div className="flex items-center gap-4 justify-center">
                <img src="/icons/tour.webp" className="w-7 h-7"></img>
                <h2 className="font-bold text-2xl">
                    Các tour du lịch phổ biến
                </h2>
            </div>
            <div className="container mx-auto relative mt-4">
                <GeneralCarousel responsive={responsive}>
                    {allTour.slice(0, 6).map((tour, index) => (
                        <TourCard tour={tour} key={index}></TourCard>
                    ))}
                </GeneralCarousel>
            </div>
            <div className="text-center mt-6">
                <div
                    onClick={() => navigate("/tour")}
                    className="inline-flex gap-2 cursor-pointer items-center px-8 py-2 border border-gray-500 rounded-md"
                >
                    <span className="font-semibold">Xem tất cả tour</span>
                    <HiOutlineExternalLink className="h-5 w-5"></HiOutlineExternalLink>
                </div>
            </div>
        </section>
    );
};

export default HomeTourList;
