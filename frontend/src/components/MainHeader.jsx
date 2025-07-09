import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BsSearch } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { NAV_LINKS } from "../constants";
import { GrLocation } from "react-icons/gr";
import UserDropdown from "./UserDropdown";
import { logout } from "../redux/features/authSlice";
import { useGetCitiesQuery } from "../redux/api/cityApiSlice";

export const MainHeader = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const { user } = useSelector((state) => state.auth);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        dispatch(logout());
        navigate("/");
    };

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
            const final = Array(3).fill(first_ct).flat();
            setCityOptions(final.slice(0, 12));
        }
    }, [cities, isCitiesLoading]);

    const [openCities, setOpenCities] = useState(false);

    function NavItem({ icon, children, href, Dropdown, notLink }) {
        const [open, setOpen] = useState(false);
        const handleClick = () => {
            if (href) {
                navigate(href);
            }
        };
        return (
            <div
                className="relative"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
                onClick={handleClick}
            >
                <div className="flex gap-2 items-center font-semibold text-[14px] px-3 py-2 rounded-full hover:bg-gray-100 cursor-pointer">
                    {icon ? <div>{icon}</div> : null}
                    {notLink ? children : <Link to={href}>{children}</Link>}
                </div>
                {open && Dropdown}
            </div>
        );
    }

    return (
        <header className="top-0 sticky bg-white border-b z-50">
            <div className="container mx-auto flex items-center py-2">
                <Link to="/" className="flex items-center">
                    <h1 className="ml-2 font-bold text-xl">vagabond</h1>
                </Link>

                <div className="flex items-center gap-1 w-[360px] mx-4 rounded-full px-4 h-9 border">
                    <button>
                        <BsSearch className="w-[16px] h-[16px]" />
                    </button>
                    <input
                        type="text"
                        placeholder="Tìm theo điểm đến, hoạt động"
                        className="flex-1 h-full px-1 outline-none border-none bg-transparent text-[14px]"
                    />
                </div>

                <nav className="flex space-x-4 items-center ml-auto font-semibold">
                    {!user ? (
                        <>
                            
                            <Link
                                to="/sign-up"
                                className="hover:text-primary transition-colors text-[14px]"
                            >
                                Đăng ký
                            </Link>
                            <Link
                                to="/sign-in"
                                className="bg-primary text-white rounded-full px-3 py-[6px] text-[14px]"
                            >
                                Đăng nhập
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                            <div
                                className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer"
                                onClick={() => setShowDropdown((prev) => !prev)}
                            >
                                <span className="text-blue-500 text-lg font-bold">
                                    {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                                </span>
                            </div>
                            <span
                                className="text-blue-500 font-semibold cursor-pointer"
                                onClick={() => setShowDropdown((prev) => !prev)}
                            >
                                {user.firstName} {user.lastName}
                            </span>
                            {showDropdown && (
                                <div className="absolute right-0 top-12 z-50">
                                    <UserDropdown onLogout={handleLogout} />
                                </div>
                            )}
                        </div>
                    )}
                </nav>
            </div>

            <div className="w-full h-[1px] bg-gray-200"></div>

            <div className="bg-white">
                <div className="container mx-auto py-1">
                    <div className="flex items-center ">
                        <div
                            onMouseEnter={() => setOpenCities(true)}
                            onMouseLeave={() => setOpenCities(false)}
                            className="flex gap-2 items-center font-semibold text-[14px] px-3 py-2 rounded-full hover:bg-gray-100 cursor-pointer"
                        >
                            <GrLocation className="w-[16px] h-[16px]" />
                            Địa điểm muốn đến
                            {openCities && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full z-50 w-screen">
                                    <div className="max-w-screen-2xl mx-auto border bg-white">
                                        <div className="grid grid-cols-4 p-4 gap-x-4 mt-1 gap-y-6">
                                            {cityOptions.map((city, index) => (
                                                <Link
                                                    to={`/city/${city._id}`}
                                                    key={index}
                                                    className="flex gap-2 items-center"
                                                >
                                                    <img
                                                        src={city.img}
                                                        alt=""
                                                        className="w-12 h-12 rounded-full"
                                                    />
                                                    <div className="flex flex-col justify-between">
                                                        <span className="text-gray-400">
                                                            Vui chơi giải trí
                                                        </span>
                                                        <h3>{city.name}</h3>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {NAV_LINKS.map((item, index) => (
                            <NavItem
                                key={index}
                                children={item.title}
                                href={item.href}
                                Dropdown={
                                    item.services.length > 0 && <Dropdown data={item.services} />
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>
            {/* {openCities && (
                <div className="">
                    <div className="w-screen border bg-white">
                        <div className="mx-auto grid grid-cols-4 p-4 gap-x-4 mt-1 gap-y-6">
                            {cityOptions.map((city, index) => (
                                <Link
                                    to={`/city/${city._id}`}
                                    key={index}
                                    className=" flex gap-2 items-center"
                                >
                                    <img src={city.img} alt="" className="w-12 h-12 rounded-full" />
                                    <div className="flex flex-col justify-between">
                                        <span className="text-gray-400">Vui chơi giải trí</span>
                                        <h3>{city.name}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )} */}
        </header>
    );
};

const Dropdown = ({ data }) => {
    return (
        <div className="absolute pt-1">
            <div className="py-2 bg-white z-10 rounded-xl shadow-lg">
                <ul>
                    {data.map((service, key) => (
                        <li key={key}>
                            <Link
                                to={service.href}
                                className="py-2 px-4 text-[14px] whitespace-nowrap block hover:text-blue-500 transition-colors"
                            >
                                {service.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
