import { SlLocationPin } from "react-icons/sl";
import { GoClock } from "react-icons/go";
import ImageGalleryFromCloudinary from "./ImageGalleryFromCloudinary";

const TourInformation = ({ tourData }) => {
    const languageOptions = [
        { label: "Tiếng Việt", value: "200" },
        { label: "Tiếng Anh", value: "201" },
        { label: "Tiếng Trung", value: "202" },
        { label: "Tiếng Hàn", value: "203" },
    ];

    return (
        <div>
            <h2 className="text-2xl font-semibold">{tourData.name}</h2>

            <div className="flex gap-4 my-2">
                <div className="flex items-center gap-2">
                    <SlLocationPin></SlLocationPin>
                    <span>{tourData.location}</span>
                </div>

                <div className="flex items-center gap-2">
                    <GoClock></GoClock>
                    <div className="flex items-center">
                        <span className="font-semibold">Thời gian tour</span>
                        <div className="mx-2 h-[20px] w-[2px] bg-gray-400"></div>
                        <span>{tourData.duration}</span>
                    </div>
                </div>
            </div>
            {tourData.images.length > 0 && (
                <div className="border border-gray-200 rounded-lg">
                    <ImageGalleryFromCloudinary
                        existingImages={tourData.images}
                        option={1}
                    />
                </div>
            )}
            <div className="mt-2">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-7 bg-blue-500 rounded"></div>
                    <h2 className="text-[20px] font-semibold">
                        Các trải nghiệm
                    </h2>
                </div>
                <div
                    className="dot pl-5 mt-3"
                    dangerouslySetInnerHTML={{
                        __html: tourData.experiences,
                    }}
                />
            </div>

            <div className="mt-2">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-7 bg-blue-500 rounded"></div>
                    <h2 className="text-[20px] font-semibold">
                        Các thông tin khác
                    </h2>
                </div>
                <div className="pl-5 space-y-2 mt-2">
                    <div className="">
                        <h3 className="font-semibold text-lg mb-2">
                            Dịch vụ ngôn ngữ
                        </h3>
                        <ul className="ml-2 ">
                            {tourData.languageService.map((val) => (
                                <li>
                                    {
                                        languageOptions.find(
                                            (options) => options.value == val
                                        ).label
                                    }
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="">
                        <h3 className="font-semibold text-lg mb-2">
                            Phù hợp với
                        </h3>
                        <div className="ml-2">{tourData.suitableFor}</div>
                    </div>
                    <div className="">
                        <h3 className="font-semibold text-lg mb-2">
                            Liên hệ đối tác
                        </h3>
                        <div className="ml-2">{tourData.contact}</div>
                    </div>
                    <div className="">
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
            <div className="mt-2">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-7 bg-blue-500 rounded"></div>
                    <h2 className="text-[20px] font-semibold">Lịch trình</h2>
                </div>
                <div
                    className="dot pl-5 mt-3"
                    dangerouslySetInnerHTML={{
                        __html: tourData.itinerary,
                    }}
                />
            </div>
        </div>
    );
};

export default TourInformation;
