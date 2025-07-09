import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { useState } from "react";
import { CLOUDINARY_BASE_URL } from "../constants/hotel";


const ImageGalleryFromCloudinary = ({ existingImages, option = 1 }) => {
    const [index, setIndex] = useState(-1); // -1 = closed

    if (!existingImages?.length) return null;

    const slides = existingImages.map((publicId) => ({
        src: `${CLOUDINARY_BASE_URL}/${publicId}`,
    }));

    if (existingImages.length === 1) {
        return (
            <>
                <div className="overflow-hidden rounded-xl h-[130px] cursor-pointer">
                    <img
                        src={`${CLOUDINARY_BASE_URL}/${existingImages[0]}`}
                        alt="only"
                        className="w-full h-full object-cover"
                        onClick={() => setIndex(0)}
                    />
                </div>
                <Lightbox
                    open={index >= 0}
                    close={() => setIndex(-1)}
                    slides={slides}
                    index={index}
                    on={{
                        view: ({ index: current }) => setIndex(current),
                    }}
                />
            </>
        );
    }

    return (
        <>
            {option === 1 ? (
                <div className="grid grid-cols-5 gap-2 h-[380px]">
                    <div className="col-span-3 row-span-2 overflow-hidden rounded-xl">
                        <img
                            src={`${CLOUDINARY_BASE_URL}/${existingImages[0]}`}
                            alt="main"
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setIndex(0)}
                        />
                    </div>

                    {existingImages.slice(1, 5).map((publicId, i) => {
                        const isLast = i === 3 && existingImages.length > 5;
                        return (
                            <div
                                key={i}
                                className="relative overflow-hidden rounded-xl cursor-pointer"
                                onClick={() => setIndex(i + 1)}
                            >
                                <img
                                    src={`${CLOUDINARY_BASE_URL}/${publicId}`}
                                    alt={`sub-${i}`}
                                    className="w-full h-full object-cover"
                                />
                                {isLast && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold">
                                        +{existingImages.length - 5}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (option === 2 ? (
                <div className="grid grid-rows-2 grid-cols-2 gap-2 h-[180px]">
                    <div className="col-span-2 overflow-hidden rounded-xl">
                        <img
                            src={`${CLOUDINARY_BASE_URL}/${existingImages[0]}`}
                            alt="main"
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setIndex(0)}
                        />
                    </div>
                    {existingImages.slice(1, 3).map((publicId, i) => {
                        const isLast = i === 2 - 1 && existingImages.length > 3; // ảnh thứ 3 và còn nhiều hơn
                        return (
                            <div
                                key={i}
                                className="relative overflow-hidden rounded-xl cursor-pointer"
                                onClick={() => setIndex(i + 1)}
                            >
                                <img
                                    src={`${CLOUDINARY_BASE_URL}/${publicId}`}
                                    alt={`sub-${i}`}
                                    className="w-full h-full object-cover"
                                />
                                {isLast && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold">
                                        +{existingImages.length - 3}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2 h-[180px]">
                    <div className="col-span-2 overflow-hidden rounded-xl">
                        <img
                            src={`${CLOUDINARY_BASE_URL}/${existingImages[0]}`}
                            alt="main"
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setIndex(0)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        {existingImages.slice(1, 3).map((publicId, i) => {
                            const isLast = i === 1 && existingImages.length > 3;
                            return (
                                <div
                                    key={i}
                                    className="relative h-full overflow-hidden rounded-xl cursor-pointer flex-1"
                                    onClick={() => setIndex(i + 1)}
                                >
                                    <img
                                        src={`${CLOUDINARY_BASE_URL}/${publicId}`}
                                        alt={`sub-${i}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {isLast && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold">
                                            +{existingImages.length - 3}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Lightbox Viewer */}
            <Lightbox
                open={index >= 0}
                close={() => setIndex(-1)}
                slides={slides}
                index={index}
                on={{
                    view: ({ index: current }) => setIndex(current),
                }}
            />
        </>
    );
};

export default ImageGalleryFromCloudinary;