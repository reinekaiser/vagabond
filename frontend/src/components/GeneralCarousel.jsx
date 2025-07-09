import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";


export default function GeneralCarousel({ responsive, children }) {

    const CustomRight = ({ onClick }) => (
        <button
            onClick={onClick}
            className="bg-white text-blue-600 p-2 rounded-full absolute top-[50%] right-2 translate-y-[-50%] hover:shadow-lg"
        >
            <MdKeyboardArrowRight className="w-6 h-6 "></MdKeyboardArrowRight>
        </button>
    );
    const CustomLeft = ({ onClick }) => (
        <button
            onClick={onClick}
            className="bg-white text-blue-600 p-2 rounded-full absolute top-[50%] left-2 translate-y-[-50%] hover:shadow-lg"
        >
            <MdKeyboardArrowLeft className="w-6 h-6"></MdKeyboardArrowLeft>
        </button>
    );

    return (
        <div className="-mx-2">
            <Carousel
                swipeable={false}
                responsive={responsive}
                itemClass="carousel-item"
                customRightArrow={<CustomRight></CustomRight>}
                customLeftArrow={<CustomLeft></CustomLeft>}
            >
                {children}
            </Carousel>
        </div>
    );
}
