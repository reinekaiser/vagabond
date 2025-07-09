import { HiPlus } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import { MdFilterList } from "react-icons/md";

import { CgClose } from "react-icons/cg";
import SelectItem from "../../components/SelectItem";
import { Drawer, Slider, Checkbox, Pagination } from "antd";

import { RiResetLeftLine } from "react-icons/ri";
import { Box, CircularProgress } from "@mui/material";
import { useGetToursQuery } from "../../redux/api/tourApiSlice";
import TourCardAdmin from "../../components/TourCardAdmin";
import { CATEGORY_OPTIONS, DURATION_OPTIONS, LANGUAGE_OPTIONS } from "../../constants/tour";

const ManageTours = () => {
    const navigate = useNavigate();
    const sortOptionList = [
        { label: "Mới nhất", value: "newest" },
        { label: "Phổ biến nhất", value: "popular" },
        { label: "Đánh giá cao nhất", value: "rating" },
        { label: "Giá từ thấp đến cao", value: "price" },
    ];

    const [openFilter, setOpenFilter] = useState(false);

    const showDrawer = () => setOpenFilter(true);
    const onClose = () => setOpenFilter(false);

    const [sort, setSort] = useState(sortOptionList[0].value);
    const [page, setPage] = useState();
    const [priceRange, setPriceRange] = useState([0, 20000000]);
    const [language, setLanguage] = useState([]);
    const [category, setCategory] = useState([]);
    const [duration, setDuration] = useState([]);

    const handleItemClick = (item, setSelectedItems) => {
        setSelectedItems((prev) => {
            if (prev.includes(item)) {
                return prev.filter((i) => i !== item);
            } else {
                return [...prev, item];
            }
        });
    };

    const handleChangePage = (newPage) => {
        setPage(newPage);
    };

    const onResetFilter = () => {
        setLanguage([]);
        setCategory([]);
        setDuration([]);
        setPriceRange([0, 20000000]);
        setPage(1);
    };

    const {
        data: tours,
        isLoading,
        refetch,
    } = useGetToursQuery({
        category: category?.join(","),
        languageService: language?.join(","),
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        duration: duration?.join(","),
        sort: sort,
        page,
        limit: 6
    });

    const [search, setSearch] = useState("");
    const [searched, setSearched] = useState(false);

    const filteredResults = useMemo(() => {
        if (!search.trim()) return [];
        return tours?.data?.filter((tour) =>
            tour?.name?.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, tours]);

    const handleSearch = () => {
        if (search.trim() === "") {
            setSearched(false);
        } else {
            setSearched(true);
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div className="bg-softBlue min-h-screen p-4 md:p-8">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Danh sách tour</h2>
                <div
                    onClick={() => {
                        navigate("/admin/manage-tours/create-tour");
                    }}
                    className="px-3 py-2 bg-blue-500 rounded-lg text-white flex items-center gap-1 cursor-pointer hover:opacity-80"
                >
                    <HiPlus className=""></HiPlus>
                    Thêm tour
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-md mt-4 p-4 md:p-6">
                <div className="flex items-center justify-between mt-4">
                    <div className="">
                        <div className="flex bg-white items-center w-[260px] py-2 px-3 border rounded-lg ">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="text-[14px] outline-none flex-1"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    if (e.target.value.trim() === "") {
                                        setSearched(false);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                            />
                            <button>
                                <FiSearch className="w-5 h-5 text-gray-400"></FiSearch>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div
                            onClick={showDrawer}
                            className="px-4 py-1 flex items-center bg-white gap-2 border hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                            <span className="font-semibold">Lọc</span>
                            <MdFilterList className="w-5 h-5"></MdFilterList>
                        </div>
                        <Drawer
                            title="Lọc"
                            placement="right"
                            open={openFilter}
                            closable={false}
                            onClose={onClose}
                            width={300}
                            styles={{
                                mask: {
                                    backgroundColor: "transparent", // Màu nhạt hơn (20% opacity)
                                },
                                body: {
                                    display: "flex",
                                    fontSize: "16px",
                                    flexDirection: "column",
                                    gap: 16,
                                },
                            }}
                            extra={
                                <div className="ml-auto flex items-center gap-[6px]">
                                    <button
                                        onClick={onResetFilter}
                                        className="p-1 hover:bg-gray-100 rounded-full"
                                    >
                                        <RiResetLeftLine></RiResetLeftLine>
                                    </button>
                                    <button
                                        className="p-1 hover:bg-gray-100 rounded-md"
                                        onClick={onClose}
                                    >
                                        <CgClose></CgClose>
                                    </button>
                                </div>
                            }
                        >
                            <div>
                                <p className="font-semibold">Danh mục tour</p>
                                <Checkbox.Group
                                    value={category}
                                    options={CATEGORY_OPTIONS}
                                    onChange={setCategory}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 8,
                                        fontSize: "20px",
                                        marginTop: "10px",
                                    }}
                                />
                            </div>
                            <div>
                                <p className="font-semibold">Giá</p>
                                <Slider
                                    range
                                    min={0}
                                    max={20000000}
                                    step={100000}
                                    value={priceRange}
                                    onChange={setPriceRange}
                                    tooltip={{
                                        formatter: (value) =>
                                            `${value.toLocaleString("vi-VN")} VND`,
                                    }}
                                    styles={{
                                        track: { background: "#3b82f6" },
                                        rail: { background: "#d9d9d9" },
                                        handle: {
                                            borderColor: "#3b82f6",
                                        },
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
                                                handleItemClick(languageOption.value, setLanguage)
                                            }
                                            key={languageOption.value}
                                            className={`cursor-pointer px-2 py-2 border rounded-lg ${
                                                language.includes(languageOption.value)
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
                                                duration.includes(durationOption.value)
                                                    ? " border-blue-500 text-blue-500 bg-white"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleItemClick(durationOption.value, setDuration)
                                            }
                                        >
                                            {durationOption.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Drawer>
                        <SelectItem
                            selectTitle={"Sắp xếp theo"}
                            optionList={sortOptionList}
                            selected={sort}
                            setSelected={setSort}
                        ></SelectItem>
                    </div>
                </div>
                <div className="mt-6">
                    {searched ? (
                        filteredResults.length > 0 ? (
                            <>
                                <p className="font-semibold text-[16px]">Kết quả tìm kiếm</p>
                                <div className="grid grid-cols-3 gap-3">
                                    {filteredResults.map((tour, index) => (
                                        <TourCardAdmin tour={tour} key={index}></TourCardAdmin>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-[14px] font-medium text-gray-500">Không tìm thấy</p>
                        )
                    ) : (
                        <div>
                            <div className="grid grid-cols-3 gap-3">
                                {tours?.data?.map((tour) => (
                                    <TourCardAdmin tour={tour}></TourCardAdmin>
                                ))}
                            </div>
                            <Pagination
                                total={tours?.totalTours}
                                align="end"
                                style={{
                                    marginTop: "20px",
                                }}
                                pageSize={tours?.pageSize}
                                current={page}
                                onChange={handleChangePage}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageTours;
