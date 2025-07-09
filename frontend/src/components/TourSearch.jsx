import { BsSearch } from "react-icons/bs";
import { useGetCitiesQuery } from "../redux/api/cityApiSlice";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGetSearchSuggestionsQuery } from "../redux/api/tourApiSlice";
import { GrLocation } from "react-icons/gr";
import { removeSearch, addSearch } from "../redux/features/recentSearchSlice";
import { CLOUDINARY_BASE_URL } from "../constants/hotel";
const TourSearch = () => {
    const navigate = useNavigate();

    const { data: cities, isCitiesLoading, error } = useGetCitiesQuery();
    if (error) console.error("Error fetching cities:", error);
    if (isCitiesLoading) return <div></div>;

    const [cityOptions, setCityOptions] = useState([]);

    useEffect(() => {
        if (!isCitiesLoading && cities) {
            const ct = cities.map((city) => ({
                _id: city._id,
                name: city.name,
            }));
            setCityOptions(ct);
        }
    }, [cities, isCitiesLoading]);

    const allCity = [...cityOptions, ...cityOptions];

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

    return (
        <div
            className="w-[940px] px-10 py-6 mx-auto mt-12 rounded-xl"
            ref={containerRef}
        >
            <div
                className={`flex items-center gap-1 border-[3px] border-[#00c2ff] rounded-lg h-14 pl-4 pr-1 py-1 text-lg hover:border-blue-400 focus-within:border-blue-400 caret-primary`}
            >
                <button>
                    <BsSearch className="text-[#7193bc] w-5 h-5"></BsSearch>
                </button>
                <input
                    type="text"
                    placeholder="Bạn có ý tưởng gì cho chuyến đi không?"
                    className="flex-1 h-full px-1 outline-none border-none bg-transparent placeholder:text-[#7193bc]"
                    onFocus={() => setIsFocused(true)}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                    className="h-full w-[120px] text-lg bg-[#0082da] text-white rounded-lg"
                    onClick={handleSearch}
                >
                    Khám phá
                </button>
            </div>
            {isFocused && (
                <div className="absolute w-[860px]  mx-auto mt-2 bg-white rounded-xl shadow-lg border p-4 z-50 min-h-[240px]">
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
                                    {recentSearches.map((item) => (
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
                                                    dispatch(removeSearch(item))
                                                }
                                                className="text-gray-400 hover:text-red-400 text-sm"
                                            >
                                                ✕
                                            </button>
                                        </li>
                                    ))}
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
                                        Các tour chúng tôi đề xuất
                                    </h4>
                                    <ul>
                                        {tourSuggestions.map((item) => (
                                            <li
                                                key={item._id}
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
                                                            {item.name}
                                                        </p>
                                                        <p className="text-gray-500">
                                                            {item.location}
                                                        </p>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                    <h4 className="font-semibold text-lg mt-2">
                                        Điểm đến bạn có thể tìm kiếm
                                    </h4>
                                    <ul>
                                        {citySuggestions.map((item) => (
                                            <li
                                                key={item._id}
                                                onClick={() =>
                                                    handleSearch(item)
                                                }
                                                className="py-1 cursor-pointer px-2 flex items-center gap-6"
                                            >
                                                <div className="p-2 rounded-full bg-gray-200">
                                                    <GrLocation className="w-6 h-6 text-gray-500"></GrLocation>
                                                </div>
                                                <span className="font-semibold">
                                                    {item.name}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
            <div className="flex flex-wrap gap-2 items-center justify-center mt-4 px-4">
                {allCity?.map((city, index) => (
                    <div
                        key={index}
                        onClick={() => navigate(`/city/${city._id}`)}
                        className="px-4 py-2 inline-block border border-blue-400 rounded-full cursor-pointer"
                    >
                        {city.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TourSearch;
