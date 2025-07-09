import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUserEdit, FaListAlt, FaCalendarCheck, FaSignOutAlt } from "react-icons/fa";

const UserDropdown = ({ onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-50 py-2">
        <Link
          to="/user/profile/edit"
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 font-semibold text-base"
        >
          <FaUserEdit className="text-blue-500" />
          Chỉnh sửa hồ sơ
        </Link>
        <Link
          to="/user/my-bookings"
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 font-semibold text-base"
        >
          <FaListAlt className="text-blue-500" />
          Đặt chỗ của tôi
        </Link>
        <Link
          to="/user/my-reviews"
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 font-semibold text-base"
        >
          <FaCalendarCheck className="text-blue-500" />
          Đánh giá
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-gray-100 text-red-500 font-semibold text-base"
        >
          <FaSignOutAlt />
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default UserDropdown; 