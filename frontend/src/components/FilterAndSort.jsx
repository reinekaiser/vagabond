import { Modal, Slider, Pagination } from "antd";
import { useState } from "react";
import { IoFilterSharp } from "react-icons/io5";
import { CATEGORY_OPTIONS, DURATION_OPTIONS, LANGUAGE_OPTIONS } from "../constants/tour";
import SelectItem from "./SelectItem";
import { useGetToursQuery } from "../redux/api/tourApiSlice";
import TourCard from "./TourCard";

const sortOptionList = [
    { label: "Mới nhất", value: "new" },
    { label: "Đánh giá cao nhất", value: "rating" },
    { label: "Giá từ thấp đến cao", value: "price" },
];

const FilterAndSort = () => {
    const [isOpen, setIsOpen] = useState(false);

    const [selectedItems, setSelectedItems] = useState([]);

    const handleItemClick = (item) => {
        setSelectedItems((prev) => {
            if (prev.includes(item)) {
                return prev.filter((i) => i !== item);
            } else {
                return [...prev, item];
            }
        });
       
    };

    function ModelContentSection({ title, children }) {
        return (
            <div>
                <div className="flex gap-2 items-center">
                    <div className="h-6 w-2 rounded-lg bg-primary"></div>
                    <h3 className="text-lg font-semibold">{title}</h3>
                </div>
                <div>{children}</div>
            </div>
        );
    }

    function SelectionItem({ item, setFilter }) {
        return (
            <div
                className={`cursor-pointer px-2 py-2 rounded-lg ${
                    selectedItems.includes(item.value)
                        ? "border border-blue_medium text-blue_medium bg-white"
                        : "bg-gray-100 border border-transparent"
                }`}
                onClick={() => {
                    handleItemClick(item.value);
                    setFilter((prev) => {
                        if (prev.includes(item.value)) {
                            return prev.filter((i) => i !== item.value);
                        } else {
                            return [...prev, item.value];
                        }
                    });
                }}
            >
                {item.label}
            </div>
        );
    }

    const [contFilter, setCountFilter] = useState(0);

    const [sort, setSort] = useState(sortOptionList[0].value);
    const [page, setPage] = useState();
    const [priceRange, setPriceRange] = useState([0, 6000000]);
    const [language, setLanguage] = useState([]);
    const [category, setCategory] = useState([]);
    const [duration, setDuration] = useState([]);

    const [appliedFilters, setAppliedFilters] = useState(true);
    const handleChangePage = (newPage) => {
        setPage(newPage);
    };
    const {
        data: tours,
        refetch,
        isLoading,
    } = useGetToursQuery(
        {
            category: category.join(","),
            languageService: language.join(","),
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            duration: duration.join(","),
            sort,
            limit: 8,
            page,
        },
        {
            skip: !appliedFilters,
        }
    );

    if (isLoading) return <>Loading</>;
    console.log(tours);
    return (
        <div>
            <p className="font-semibold text-2xl">Những tour không thể bỏ lỡ</p>
            <div className="flex items-center justify-between mt-4">
                <button
                    className="flex items-center gap-2 rounded-lg border-2 border-gray-900 px-4 py-2"
                    onClick={() => {
                        setIsOpen(true);
                        setAppliedFilters(false);
                    }}
                >
                    <IoFilterSharp className="w-5 h-5"></IoFilterSharp>
                    Lọc
                </button>

                <Modal
                    title={<p className="text-[20px] font-bold px-4 pt-2">Lọc</p>}
                    footer={null}
                    open={isOpen}
                    onCancel={() => {
                        setIsOpen(false);
                        setAppliedFilters(true);
                        setCountFilter(language.length + category.length + duration.length);
                    }}
                    width={700}
                    centered
                    styles={{
                        content: {
                            fontSize: "16px",
                            overflow: "hidden",
                            padding: 0,
                        },
                    }}
                >
                    <div className="max-h-[440px] mt-4 overflow-auto ">
                        <div className="space-y-4 px-6 py-4">
                            <ModelContentSection title={"Danh mục"}>
                                <div className="flex gap-3 flex-wrap mt-4">
                                    {CATEGORY_OPTIONS.map((cate, key) => (
                                        <SelectionItem
                                            key={key}
                                            item={cate}
                                            setFilter={setCategory}
                                        ></SelectionItem>
                                    ))}
                                </div>
                            </ModelContentSection>
                            <ModelContentSection title={"Giá"}>
                                <span>
                                    {priceRange[0].toLocaleString("vi-VN")} VND -{" "}
                                    {priceRange[1].toLocaleString("vi-VN")} VND
                                </span>
                                <Slider
                                    range
                                    min={0}
                                    max={6000000}
                                    value={priceRange}
                                    onChange={(newVal) => setPriceRange(newVal)}
                                    tooltip={{
                                        formatter: (value) =>
                                            `${value.toLocaleString("vi-VN")} VND`,
                                    }}
                                    styles={{
                                        track: { background: "#3b82f6" }, // Màu phần được chọn (track)
                                        rail: { background: "#d9d9d9" }, // Màu phần nền (rail)
                                        handle: {
                                            borderColor: "#3b82f6",
                                        },
                                    }}
                                    afterOpenChange={(opened) => {
                                        if (opened) {
                                            setTimeout(() => {
                                                window.dispatchEvent(new Event("resize"));
                                            }, 100);
                                        }
                                    }}
                                />
                            </ModelContentSection>
                            <ModelContentSection title={"Hướng dẫn viên"}>
                                <div className="flex gap-3 flex-wrap mt-4">
                                    {LANGUAGE_OPTIONS.map((lang, key) => (
                                        <SelectionItem
                                            key={key}
                                            item={lang}
                                            setFilter={setLanguage}
                                        ></SelectionItem>
                                    ))}
                                </div>
                            </ModelContentSection>
                            <ModelContentSection title={"Thời lượng"}>
                                <div className="flex gap-3 flex-wrap mt-4">
                                    {DURATION_OPTIONS.map((duration, key) => (
                                        <SelectionItem
                                            key={key}
                                            item={duration}
                                            setFilter={setDuration}
                                        ></SelectionItem>
                                    ))}
                                </div>
                            </ModelContentSection>
                        </div>
                        <div className="flex items-center justify-between p-6">
                            <span
                                onClick={() => {
                                    setCategory([]);
                                    setDuration([]);
                                    setSelectedItems([]);
                                    setLanguage([]);
                                    setPriceRange([0, 6000000]);
                                }}
                                className="px-2 py-1 text-base underline font-semibold cursor-pointer"
                            >
                                Xóa
                            </span>
                            <button
                                onClick={() => {
                                    setAppliedFilters(true);
                                    setIsOpen(false);
                                }}
                                className="text-white bg-primary text-base font-semibold px-4 py-2 rounded-xl"
                            >
                                Xem kết quả
                            </button>
                        </div>
                    </div>
                </Modal>
                <SelectItem
                    selectTitle={"Sắp xếp theo"}
                    optionList={sortOptionList}
                    selected={sort}
                    setSelected={(newSort) => {
                        setSort(newSort);
                    }}
                ></SelectItem>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-6">
                {tours.data?.map((tour, key) => (
                    <TourCard tour={tour} key={key}></TourCard>
                ))}
            </div>
            <Pagination
                total={tours?.totalTours}
                align="center"
                style={{
                    marginTop: "20px",
                }}
                pageSize={tours?.pageSize}
                current={page}
                onChange={handleChangePage}
            />
        </div>
    );
};

export default FilterAndSort;
