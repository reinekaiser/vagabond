import { useLocation, useNavigate } from "react-router-dom";
import TourCard from "../../components/TourCard";
import { useGetSearchResultsQuery } from "../../redux/api/tourApiSlice";

import { useState, useEffect } from "react";

import { Slider, Checkbox, Pagination } from "antd";

import {
    CATEGORY_OPTIONS,
    DURATION_OPTIONS,
    LANGUAGE_OPTIONS,
} from "../../constants/tour";
import SelectItem from "../../components/SelectItem";

const SearchResultsPage = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const queryParams = Object.fromEntries(new URLSearchParams(search));
    const sortOptionList = [
        { label: "Liên quan nhất", value: "relevance" },
        { label: "Mới nhất", value: "new" },
        { label: "Đánh giá cao nhất", value: "rating" },
        { label: "Giá từ thấp đến cao", value: "price" },
    ];

    const [sort, setSort] = useState(sortOptionList[0].value);

    const [priceRange, setPriceRange] = useState([0, 2000000]);
    const [language, setLanguage] = useState([]);
    const [category, setCategory] = useState([]);
    const [duration, setDuration] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const handleFiler = (item, setFilter) => {
        setFilter((prev) => {
            if (prev.includes(item)) {
                return prev.filter((i) => i !== item);
            } else {
                return [...prev, item];
            }
        });
        setPage(1);
    };

    const handlePageChange = (page, pageSize) => {
        setPage(page);
        setPageSize(pageSize);
    };

    const { data, isLoading, error } = useGetSearchResultsQuery({
        category: category.join(","),
        languageService: language.join(","),
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        duration: duration.join(","),
        sort,
        ...queryParams,
        page,
        pageSize,
    });
    const currentPage = Number(page) || 1;

    if (isLoading) return <div>Đang tải...</div>;
    if (error) return <div>Lỗi khi tải dữ liệu</div>;

    return (
        <div className="">
            <h2 className="container mx-auto text-2xl font-semibold my-4">
                Hoạt động khớp với "{queryParams.query}"
            </h2>
            <div className="bg-[#f5f5f5] border border-t pt-4 pb-8">
                <div className="container mx-auto flex gap-6 items-start ">
                    <div className="w-[25%] p-4 border rounded-xl bg-white border-gray-200 space-y-5">
                        <div>
                            <p className="font-semibold">Danh mục tour</p>
                            <Checkbox.Group
                                value={category}
                                options={CATEGORY_OPTIONS}
                                onChange={(newCate) => {
                                    setCategory(newCate);
                                    setPage(1);
                                }}
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 8,
                                    fontSize: "20px",
                                    marginTop: "10px",
                                    padding: "0 10px",
                                }}
                            />
                        </div>
                        <div className="">
                            <p className="font-semibold">Giá</p>
                            <Slider
                                range
                                min={0}
                                max={2000000}
                                step={100000}
                                value={priceRange}
                                onChange={(newRange) => {
                                    setPriceRange(newRange);
                                    setPage(1)
                                }}
                                tooltip={{
                                    formatter: (value) =>
                                        `${value.toLocaleString("vi-VN")} VND`,
                                }}
                                styles={{
                                    track: { background: "#3b82f6" }, // Màu phần được chọn (track)
                                    rail: { background: "#d9d9d9" }, // Màu phần nền (rail)
                                    handle: {
                                        borderColor: "#3b82f6",
                                    }, // Màu handle
                                }}
                            />
                            <div className="flex items-center gap-2">
                                <div className="border rounded-md px-2 py-1 text-sm flex-1">
                                    {priceRange[0].toLocaleString("vi-VN")} VND
                                </div>
                                <div className="h-[1px] w-2 bg-gray-300"></div>
                                <div className="border rounded-md px-2 py-1 text-sm">
                                    {priceRange[1].toLocaleString("vi-VN")} VND
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold">Dịch vụ ngôn ngữ</p>
                            <div className="flex gap-3 mt-3 flex-wrap">
                                {LANGUAGE_OPTIONS.map((languageOption) => (
                                    <div
                                        onClick={() =>
                                            handleFiler(
                                                languageOption.value,
                                                setLanguage
                                            )
                                        }
                                        key={languageOption.value}
                                        className={`cursor-pointer px-2 py-2 border rounded-lg ${
                                            language.includes(
                                                languageOption.value
                                            )
                                                ? " border-blue-500 text-blue-500 bg-white"
                                                : ""
                                        }`}
                                    >
                                        {languageOption.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold">Thời lượng</p>
                            <div className="flex gap-3 mt-3 flex-wrap">
                                {DURATION_OPTIONS.map((durationOption) => (
                                    <div
                                        key={durationOption.value}
                                        className={`cursor-pointer border px-2 py-2 rounded-lg ${
                                            duration.includes(
                                                durationOption.value
                                            )
                                                ? " border-blue-500 text-blue-500 bg-white"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleFiler(
                                                durationOption.value,
                                                setDuration
                                            )
                                        }
                                    >
                                        {durationOption.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <p className="">Tìm thấy {data.total} kết quả</p>
                            <SelectItem
                                selectTitle={"Sắp xếp theo"}
                                optionList={sortOptionList}
                                selected={sort}
                                setSelected={(newSort) => {
                                    setSort(newSort);
                                }}
                            ></SelectItem>
                        </div>
                        <div className="">
                            <div className="grid grid-cols-3 gap-5 mt-4">
                                {data?.tours?.map((tour, index) => (
                                    <TourCard
                                        tour={tour}
                                        key={index}
                                    ></TourCard>
                                ))}
                            </div>
                            {data.total > 0 && (
                                <Pagination
                                    total={data.total}
                                    align="end"
                                    style={{
                                        marginTop: "20px",
                                    }}
                                    pageSize={6}
                                    current={currentPage}
                                    onChange={handlePageChange}
                                ></Pagination>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchResultsPage;
