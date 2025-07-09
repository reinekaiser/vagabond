import { BsSearch } from "react-icons/bs";
import { Collapse } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    useGetSearchSuggestionsQuery,
    useGetTourStatsQuery,
} from "../../redux/api/tourApiSlice";
import { GrLocation } from "react-icons/gr";
import {
    removeSearch,
    addSearch,
} from "../../redux/features/recentSearchSlice";
import { CLOUDINARY_BASE_URL } from "../../constants/hotel.js";
import TopHeader from "../../components/TopHeader.jsx";
import FilterAndSort from "../../components/FilterAndSort.jsx";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { CiSearch } from "react-icons/ci";
import { useGetCitiesQuery } from "../../redux/api/cityApiSlice.js";

const sortOptionList = [
    { label: "Liên quan nhất", value: "relevance" },
    { label: "Mới nhất", value: "new" },
    { label: "Đánh giá cao nhất", value: "rating" },
    { label: "Giá từ thấp đến cao", value: "price" },
];

const TourList = () => {
    const navigate = useNavigate();
    const responsiveReviewCardList = {
        desktop: {
            breakpoint: {
                max: 3000,
                min: 1024,
            },
            items: 2,
        },
        mobile: {
            breakpoint: {
                max: 464,
                min: 0,
            },
            items: 1,
        },
        tablet: {
            breakpoint: {
                max: 1024,
                min: 464,
            },
            items: 1,
        },
    };

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef(null);
    const debounceTimeout = useRef(null);

    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);
        return () => clearTimeout(debounceTimeout.current);
    }, [query]);

    const dispatch = useDispatch();

    const recentSearches = useSelector((state) => state.recentSearch);
    const { data, isFetching } = useGetSearchSuggestionsQuery(debouncedQuery, {
        skip: debouncedQuery.trim() === "",
    });

    const handleSearch = () => {
        if (!query.trim()) return;
        dispatch(addSearch(query));
        setQuery("");
        setIsFocused(false);
        navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    };

    const tourSuggestions = data?.tours || [];
    const citySuggestions = data?.cities || [];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { data: cities, isCitiesLoading, error } = useGetCitiesQuery();
    if (error) console.error("Error fetching cities:", error);
    if (isCitiesLoading) return <div></div>;

    const [cityOptions, setCityOptions] = useState([]);

    useEffect(() => {
        if (!isCitiesLoading && cities) {
            const first_ct = cities.map((city) => ({
                _id: city._id,
                name: city.name,
                img: city.img[0],
            }));
            const final = first_ct.concat(first_ct.slice(0, 2));
            setCityOptions(final);
        }
    }, [cities, isCitiesLoading]);

    return (
        <>
            <TopHeader></TopHeader>
            <div className="bg-[url('/images/tour-list/hero_background.jpg')] bg-no-repeat h-[450px] relative bg-cover">
                <div className="container mx-auto py-10">
                    <h2 className="text-white text-[60px] font-semibold">
                        Tour & Trải nghiệm
                    </h2>
                    <p className="text-white text-xl font-semibold">
                        Tour du lịch, trải nghiệm khám phá và hơn thế nữa
                    </p>
                    <div className="mx-auto mt-8 rounded-xl">
                        <div
                            ref={containerRef}
                            className={`flex items-center gap-1 w-[700px] bg-white h-16 rounded-full pl-4 text-lg font-semibold pr-2 py-2 caret-primary mt-6 relative`}
                        >
                            <button>
                                <GrLocation className="w-6 h-6"></GrLocation>
                            </button>
                            <input
                                type="text"
                                placeholder="Tìm kiếm"
                                className="flex-1 h-full px-1 outline-none border-none bg-transparent"
                                onFocus={() => setIsFocused(true)}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleSearch()
                                }
                            />
                            <button className="bg-primary h-full w-[100px] text-center flex items-center justify-center text-white rounded-full">
                                <CiSearch className="w-[28px] h-[28px]"></CiSearch>
                            </button>
                            {isFocused && (
                                <div className="absolute w-[700px] top-[58px] left-0 mt-2 bg-white rounded-xl shadow-lg border p-4 z-50 min-h-[240px]">
                                    {query.trim() === "" ? (
                                        <>
                                            <h4 className="text-gray-500 font-semibold mb-2">
                                                Lịch sử tìm kiếm
                                            </h4>
                                            {recentSearches.length === 0 ? (
                                                <p className="text-gray-400 text-sm">
                                                    Chưa có tìm kiếm nào
                                                </p>
                                            ) : (
                                                <ul>
                                                    {recentSearches.map(
                                                        (item) => (
                                                            <li
                                                                key={item}
                                                                className="flex justify-between items-center py-1"
                                                            >
                                                                <span
                                                                    className="text-gray-600 cursor-pointer "
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/search?query=${encodeURIComponent(
                                                                                item
                                                                            )}`
                                                                        )
                                                                    }
                                                                >
                                                                    {item}
                                                                </span>
                                                                <button
                                                                    onClick={() =>
                                                                        dispatch(
                                                                            removeSearch(
                                                                                item
                                                                            )
                                                                        )
                                                                    }
                                                                    className="text-gray-400 hover:text-red-400 text-sm"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            {isFetching ? (
                                                <p className="text-gray-400 text-sm">
                                                    Đang tìm kiếm...
                                                </p>
                                            ) : tourSuggestions.length +
                                                  citySuggestions.length ===
                                              0 ? (
                                                <p className="text-gray-400 text-sm">
                                                    Không tìm thấy kết quả
                                                </p>
                                            ) : (
                                                <>
                                                    <h4 className="font-semibold text-lg">
                                                        Các tour chúng tôi đề
                                                        xuất
                                                    </h4>
                                                    <ul>
                                                        {tourSuggestions.map(
                                                            (item) => (
                                                                <li
                                                                    key={
                                                                        item._id
                                                                    }
                                                                    className="py-1 cursor-pointer rounded px-2 mt-4"
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/tour/${item._id}`
                                                                        )
                                                                    }
                                                                >
                                                                    <div className="flex gap-2 items-center">
                                                                        <img
                                                                            src={`${CLOUDINARY_BASE_URL}/${item.images[0]}`}
                                                                            alt=""
                                                                            className="w-10 h-10 rounded-lg"
                                                                        />
                                                                        <div>
                                                                            <p className="font-semibold">
                                                                                {
                                                                                    item.name
                                                                                }
                                                                            </p>
                                                                            <p className="text-gray-500">
                                                                                {
                                                                                    item.location
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                    <h4 className="font-semibold text-lg mt-2">
                                                        Điểm đến bạn có thể tìm
                                                        kiếm
                                                    </h4>
                                                    <ul>
                                                        {citySuggestions.map(
                                                            (item) => (
                                                                <li
                                                                    key={
                                                                        item._id
                                                                    }
                                                                    onClick={() =>
                                                                        handleSearch(
                                                                            item
                                                                        )
                                                                    }
                                                                    className="py-1 cursor-pointer px-2 flex items-center gap-6"
                                                                >
                                                                    <div className="p-2 rounded-full bg-gray-200">
                                                                        <GrLocation className="w-6 h-6 text-gray-500"></GrLocation>
                                                                    </div>
                                                                    <span className="font-semibold">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </span>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-4 absolute -bottom-20 container mx-auto">
                        {cityOptions.map((city, index) => (
                            <Link to={`/city/${city._id}`} className="flex-1" key={index}>
                                <div className="p-3 bg-white rounded-3xl h-full border">
                                    <img
                                        src={city.img}
                                        className="h-[130px] object-cover w-full rounded-3xl"
                                    ></img>
                                    <h3 className="font-semibold text-base mt-3">
                                        {city.name}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <div className="container mx-auto mb-20">
                <div className="mt-[120px]">
                    <FilterAndSort></FilterAndSort>
                </div>
                <div className="mt-12">
                    <h2 className="text-2xl font-semibold">
                        Câu hỏi thường gặp về hoạt động ở điểm đến phổ biến
                    </h2>
                    <div className="mt-4">
                        <FrequentQuestions></FrequentQuestions>
                    </div>
                </div>
            </div>
        </>
    );
};

const FrequentQuestions = () => {
    const text = "Nội dung của panel";
    const panelStyle = {
        background: "#fff",
        border: "1px solid #e8e8e8",
    };

    const { data, refetch, isLoading } = useGetTourStatsQuery();

    const getItems = (style) => [
        {
            key: "1",
            label: (
                <p className="text-xl py-2 font-semibold">
                    Vagabond có bao nhiêu Tour & Trải nghiệm?
                </p>
            ),
            children: (
                <p className="text-base">
                    Klook có {data.totalCount} Tour & Trải nghiệm tại các địa
                    điểm nổi tiếng
                </p>
            ),
            style,
        },
        {
            key: "2",
            label: (
                <p className="text-xl py-2 font-semibold">
                    Những Tour & Trải nghiệm được đánh giá cao là gì?
                </p>
            ),
            children: (
                <div className="text-base">
                    <p>
                        Tour & Trải nghiệm được đánh giá cao tại các địa điểm
                        nổi tiếng là:
                    </p>
                    <ul className="list-disc pl-6 space-y-3 mt-2">
                        {data.topRatedTours.map((tour, index) => (
                            <li key={index} className="underline text-blue-500">
                                <Link to={`/tour/${tour._id}`}>
                                    {tour.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ),
            style,
        },
        {
            key: "3",
            label: (
                <p className="text-xl py-2 font-semibold">
                    Những Tour & Trải nghiệm nào có giá hợp lý?
                </p>
            ),
            children: (
                <div className="text-base">
                    <p>
                        Tour & Trải nghiệm được đánh giá cao tại các địa điểm
                        nổi tiếng là:
                    </p>
                    <ul className="list-disc pl-6 space-y-3 mt-2">
                        {data.cheapestTours.map((tour, index) => (
                            <li key={index} className="underline text-blue-500">
                                <Link to={`/tour/${tour._id}`}>
                                    {tour.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ),
            style,
        },
        {
            key: "4",
            label: (
                <p className="text-xl py-2 font-semibold">
                    Có Tour & Trải nghiệm nào mới nhất?
                </p>
            ),
            children: (
                <div className="text-base">
                    <p>
                        Tour & Trải nghiệm được đánh giá cao tại các địa điểm
                        nổi tiếng là:
                    </p>
                    <ul className="list-disc pl-6 space-y-3 mt-2">
                        {data.newestTours.map((tour, index) => (
                            <li key={index} className="underline text-blue-500">
                                <Link to={`/tour/${tour._id}`}>
                                    {tour.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ),
            style: {
                ...style,
                borderRadius: "0 0 8px 8px",
            },
        },
    ];

    if (isLoading) return <div>Loading</div>;
    console.log(data);
    return (
        <Collapse
            accordion
            bordered={false}
            defaultActiveKey={["1"]}
            expandIcon={({ isActive }) => (
                <MdOutlineKeyboardArrowDown
                    className={`w-5 h-5 ${
                        isActive ? "rotate-180" : "rotate-0"
                    }`}
                />
            )}
            className="rounded-lg"
            expandIconPosition="end"
            items={getItems(panelStyle)}
        ></Collapse>
    );
};

export default TourList;
