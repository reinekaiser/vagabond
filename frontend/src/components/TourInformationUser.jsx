import { SlLocationPin } from "react-icons/sl";
import { GoClock } from "react-icons/go";
import { BsQuestionCircleFill } from "react-icons/bs";
import ImageGalleryFromCloudinary from "./ImageGalleryFromCloudinary";
import { RiFileList3Fill } from "react-icons/ri";
import { IoIosArrowForward } from "react-icons/io";
import { GrLanguage } from "react-icons/gr";
import { AiFillLike } from "react-icons/ai";
import { FaPhoneFlip } from "react-icons/fa6";
import { GrNotes } from "react-icons/gr";
import { FaRegCommentDots } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { Modal } from "antd";
import { LANGUAGE_OPTIONS } from "../constants/tour";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import dayjs from "dayjs";
import "dayjs/locale/vi";
dayjs.locale("vi");

const customIcon = new L.Icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconAnchor: [12, 41],
});

const TourInformationUser = ({ tourData, scrollToTicket, scrollToReview }) => {
    const [isModalExpOpen, setIsModalExpOpen] = useState(false);
    const showModalExp = () => {
        setIsModalExpOpen(true);
    };

    const handleCancelExp = () => {
        setIsModalExpOpen(false);
    };

    const [isModalPlusOpen, setIsModalPluspOpen] = useState(false);
    const handleCancelPlus = () => {
        setIsModalPluspOpen(false);
    };
    const showModalPlus = () => {
        setIsModalPluspOpen(true);
    };

    const [isModalItiOpen, setIsModalItiOpen] = useState(false);
    const handleCancelIti = () => {
        setIsModalItiOpen(false);
    };
    const showModalIti = () => {
        setIsModalItiOpen(true);
    };

    const [isModalLocationOpen, setIsModalLocationOpen] = useState(false);
    const getLatLngFromAddress = async (address) => {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                address
            )}`
        );
        const data = await response.json();
        if (data.length > 0) {
            const { lat, lon } = data[0];
            return [parseFloat(lat), parseFloat(lon)];
        }
        throw new Error("Không tìm thấy địa chỉ.");
    };

    const [position, setPosition] = useState(null);
    useEffect(() => {
        getLatLngFromAddress(tourData.location).then(setPosition).catch(console.error);
    }, []);

    const KeepCenter = ({ position }) => {
        const map = useMapEvents({
            zoomend: () => {
                map.flyTo(position);
            },
        });

        return null;
    };

    const MapInvalidateOnOpen = ({ modalOpen }) => {
        const map = useMap();

        useEffect(() => {
            if (modalOpen) {
                setTimeout(() => {
                    map.invalidateSize();
                }, 200);
            }
        }, [modalOpen, map]);

        return null;
    };

    return (
        <div className="py-6">
            <h2 className="text-3xl font-bold mt-4 text-white">{tourData.name}</h2>

            <div className="flex gap-4 my-2 text-white">
                <div className="flex items-center gap-2 font-semibold">
                    <SlLocationPin></SlLocationPin>
                    <span>{tourData.location}</span>
                </div>

                <div className="flex items-center gap-2">
                    <GoClock></GoClock>
                    <div className="flex items-center">
                        <span className="font-bold">Thời gian tour</span>
                        <div className="mx-2 h-[20px] w-[2px] bg-gray-400 font-semibold"></div>
                        <span>{tourData.duration}</span>
                    </div>
                </div>
            </div>
            {tourData.images.length > 0 && (
                <div className="border border-gray-200 rounded-lg">
                    <ImageGalleryFromCloudinary existingImages={tourData.images} option={1} />
                </div>
            )}
            <div className="flex mt-6 gap-2">
                <div className="w-[60%] grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 rounded-lg flex items-center justify-between  px-3">
                        <div className="text-blue-400">
                            <span className="text-2xl font-bold text-primary">
                                {tourData.avgRating || 4.2}
                            </span>
                            /5
                        </div>
                        <div>
                            <p className="font-semibold">Xuất sắc</p>
                            <p className="font-bold text-primary">
                                {tourData.numReview} đánh giá
                            </p>
                        </div>
                    </div>
                    <div
                        className="col-span-2 p-3 flex gap-2 items-center bg-blue-50 rounded-lg cursor-pointer"
                        onClick={() => setIsModalLocationOpen(true)}
                    >
                        <SlLocationPin className="font-bold w-7 h-7 text-blue_medium"></SlLocationPin>
                        <div className="flex flex-col justify-between ">
                            <p className="font-bold text-primary flex items-center gap-1">
                                Xem bản đồ{" "}
                                <span className="text-[#0194f3] font-bold">
                                    <IoIosArrowForward className="w-5 h-5"></IoIosArrowForward>
                                </span>
                            </p>
                            <p className="font-semibold">{tourData.location.split(", ")[0]}</p>
                        </div>
                    </div>

                    <Modal
                        title={<p className="text-xl font-blod">Thông tin địa điểm</p>}
                        open={isModalLocationOpen}
                        onCancel={() => setIsModalLocationOpen(false)}
                        footer={null}
                        width={"50%"}
                        centered
                    >
                        <MapContainer
                            center={position}
                            zoom={13}
                            style={{
                                height: "400px",
                                borderRadius: "8px",
                                zIndex: 0,
                            }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                            ></TileLayer>
                            <KeepCenter position={position}></KeepCenter>
                            <Marker position={position} icon={customIcon}>
                                <Popup>{tourData.location}</Popup>
                            </Marker>
                            <MapInvalidateOnOpen
                                modalOpen={isModalLocationOpen}
                            ></MapInvalidateOnOpen>
                        </MapContainer>
                    </Modal>
                </div>
                <div className="flex flex-1 items-center justify-between p-3  rounded-lg bg-[#fff4ef]">
                    <div>
                        <p className="text-sm">Bắt đầu từ</p>
                        <p className="text-xl font-bold text-[#fd5d1c]">
                            {tourData.fromPrice.toLocaleString("vi-VN")} VND
                        </p>
                    </div>
                    <div onClick={scrollToTicket} className="px-8 py-2 bg-[#fd5d1c] rounded-full text-white cursor-pointer">
                        Tìm Tour
                    </div>
                </div>
            </div>
            <div className="flex mt-4 gap-2 h-[226px]">
                <div className="w-[60%] p-4 bg-[#f7f9fa] rounded-lg font-semibold flex flex-col gap-2">
                    <div className="flex gap-2">
                        <BsQuestionCircleFill className="text-blue_medium w-6 h-6 mt-[2px] flex-shrink-0"></BsQuestionCircleFill>
                        <div className="flex flex-col text-blue_medium ">
                            <div className="relative">
                                <h3 className="">Bạn sẽ trải nghiệm</h3>
                                <div
                                    className="dot max-h-[100px] overflow-hidden text-gray-700 bg-transparent"
                                    dangerouslySetInnerHTML={{
                                        __html: tourData.experiences,
                                    }}
                                />

                                <div className="absolute top-[100px] left-0 w-full h-5 bg-gradient-to-t from-[#f7f9fa] to-transparent pointer-events-none" />
                                <p
                                    className="cursor-pointer font-bold -mt-1"
                                    onClick={showModalExp}
                                >
                                    Đọc thêm
                                </p>
                                <Modal
                                    title={<p className="text-xl font-bold">Bạn sẽ trải nghiệm</p>}
                                    open={isModalExpOpen}
                                    onCancel={handleCancelExp}
                                    footer={null}
                                    width={"60%"}
                                >
                                    <div
                                        className="dot text-base font-semibold px-4"
                                        dangerouslySetInnerHTML={{
                                            __html: tourData.experiences,
                                        }}
                                    />
                                </Modal>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center border-t-[1.5px] pt-3">
                        <RiFileList3Fill className="w-6 h-6 text-blue_medium"></RiFileList3Fill>
                        <p className="text-blue_medium cursor-pointer" onClick={showModalPlus}>
                            Thông tin liên hệ, Tiện ích, Dịch vụ ngôn ngữ và nhiều thông tin khác
                        </p>
                        <Modal
                            title={
                                <p className="text-xl font-bold border-b px-5 py-3">
                                    Thêm thông tin
                                </p>
                            }
                            onCancel={handleCancelPlus}
                            open={isModalPlusOpen}
                            footer={null}
                            width={"60%"}
                            centered
                            styles={{
                                content: {
                                    padding: "0",
                                    overflow: "hidden",
                                },
                            }}
                        >
                            <div className="space-y-2 mt-2 text-base h-[400px] overflow-auto">
                                <div className="flex gap-3 px-6 py-2 border-b">
                                    <GrLanguage className="w-6 h-6 text-gray-500 mt-1"></GrLanguage>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">
                                            Dịch vụ ngôn ngữ
                                        </h3>
                                        <ul className="ml-2 ">
                                            {tourData.languageService.map((val) => (
                                                <li>
                                                    {
                                                        LANGUAGE_OPTIONS.find(
                                                            (options) => options.value == val
                                                        ).label
                                                    }
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="flex gap-3 px-6 py-2 border-b">
                                    <AiFillLike className="w-6 h-6 text-gray-500  flex-shrink-0"></AiFillLike>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">Phù hợp với</h3>
                                        <div className="ml-2">{tourData.suitableFor}</div>
                                    </div>
                                </div>
                                <div className="flex gap-3  px-6 py-2 border-b">
                                    <FaPhoneFlip className="w-6 h-6 text-gray-500 mt-1 flex-shrink-0"></FaPhoneFlip>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">
                                            Liên hệ đối tác
                                        </h3>
                                        <div className="ml-2">{tourData.contact}</div>
                                    </div>
                                </div>
                                <div className="flex gap-3  px-6 py-2 border-b">
                                    <GrNotes className="w-6 h-6 text-gray-500 mt-2 flex-shrink-0"></GrNotes>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">
                                            Thông tin thêm
                                        </h3>
                                        <div
                                            className="dot mt-3"
                                            dangerouslySetInnerHTML={{
                                                __html: tourData.additionalInformation,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Modal>
                    </div>
                </div>
                {tourData.reviews.length > 0 ? (
                    <div className="flex-1 flex h-full overflow-auto flex-col gap-2 rounded-lg">
                        <div className="flex gap-2">
                            <p className="font-semibold text-base ">Ấn tượng từ những du khách khác</p>
                            <p onClick={scrollToReview} className="font-semibold text-primary text-center cursor-pointer">Xem tất cả đánh giá</p>
                        </div>
                        <div className="p-3 bg-[#f7f9fa] flex flex-col flex-1 ">
                            <div className="flex items-start gap-2">
                                <div className="flex items-center gap-2">
                                    {tourData.reviews[0].userId.profilePicture ? (
                                        <img
                                            src={tourData.reviews[0].userId.profilePicture}
                                            className="w-6 h-6 rounded-full"
                                        ></img>
                                    ) : (
                                        <div className="w-7 h-7 text-sm rounded-full flex items-center justify-center bg-[#8dbd8b] text-gray-200 gap-[2px]">
                                            <span>{tourData.reviews[0].userId.firstName[0]}</span>
                                            <span>{tourData.reviews[0].userId.lastName[0]}</span>
                                        </div>
                                    )}

                                    <div className="flex text-sm flex-col gap-0.5">
                                        <p className="font-semibold">
                                            {tourData.reviews[0].userId.firstName}{" "}
                                            {tourData.reviews[0].userId.lastName}
                                        </p>
                                        <p className="text-gray-400">
                                            {dayjs(tourData.reviews[0].createdAt).format(
                                                "DD/MM/YYYY"
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="ml-auto">
                                    <span className="text-primary font-bold text-lg">
                                        {tourData.reviews[0].rating}
                                    </span>
                                    <span className="font-bold text-gray-500">/5</span>
                                </div>
                            </div>
                            <p className="line-clamp-5 flex-1 text-sm mt-auto">{tourData.reviews[0].comment}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="flex-1 flex items-center justify-center flex-col bg-[#f7f9fa] rounded-lg">
                            <FaRegCommentDots></FaRegCommentDots>
                            <p className="font-bold">Để lại đánh giá khi bạn có thể!</p>
                            <p className="text-sm text-center">
                                Điều này sẽ giúp các du khách khác khi họ lên kế hoạch du lịch.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4">
                <div className="relative">
                    <h3 className="text-[20px] font-bold text-center">Lịch trình tour</h3>
                    <div
                        className="dot max-h-[150px] overflow-hidden text-gray-700 bg-transparent font-semibold"
                        dangerouslySetInnerHTML={{
                            __html: tourData.itinerary,
                        }}
                    />

                    <div className="absolute top-[155px] left-0 w-full h-5 bg-gradient-to-t from-[#ffffff] to-transparent pointer-events-none" />
                    <span
                        className="cursor-pointer font-bold -mt-1 inline-flex gap-2 items-center text-blue_medium"
                        onClick={showModalIti}
                    >
                        Xem lịch trình đầy đủ{" "}
                        <span className="text-primary_bold font-bold">
                            <IoIosArrowForward></IoIosArrowForward>
                        </span>
                    </span>
                    <Modal
                        title={<p className="text-xl font-bold">Lịch trình tour</p>}
                        open={isModalItiOpen}
                        onCancel={handleCancelIti}
                        footer={null}
                        width={"60%"}
                    >
                        <div
                            className="dot text-gray-700 bg-transparent text-base font-semibold"
                            dangerouslySetInnerHTML={{
                                __html: tourData.itinerary,
                            }}
                        />
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default TourInformationUser;
