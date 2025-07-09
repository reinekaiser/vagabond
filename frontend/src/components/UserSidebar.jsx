import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaCalendarCheck, FaListAlt, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../redux/features/authSlice'
import { useSelector, useDispatch } from 'react-redux';
import { MdRateReview } from "react-icons/md";
import { toast } from 'react-toastify';
import axios from 'axios';


const sidebarItems = [
  {
    label: 'Tài khoản',
    icon: <FaUser className="text-xl" />,
    to: '/user/profile/edit',
  },
  {
    label: 'Đặt chỗ của tôi',
    icon: <FaCalendarCheck className="text-xl" />,
    to: '/user/my-bookings',
  },
  {
    label: 'Đánh giá',
    icon: <MdRateReview className="text-xl" />,
    to: '/user/my-reviews',
  },
];

const UserSidebar = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [userInfo, setUserInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'));
    } catch {
      return null;
    }
  });

  // Khi đăng xuất, set userInfo về null
  const handleLogout = async () => {
    localStorage.clear();
    dispatch(logout());
    // if (onLogout) onLogout();
    navigate('/');
    try {
      setIsLoggingOut(true);
      await axios.post('/api/users/logout');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      setUserInfo(null);
      toast.success('Đăng xuất thành công!');
      if (onLogout) onLogout();
      // Force reload để xóa mọi state cũ
      window.location.href = '/';
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      toast.error('Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại!');
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const syncUserInfo = () => {
      try {
        setUserInfo(JSON.parse(localStorage.getItem('userInfo')));
      } catch {
        setUserInfo(null);
      }
    };
    window.addEventListener('storage', syncUserInfo);
    return () => window.removeEventListener('storage', syncUserInfo);
  }, []);

  return (
    <aside className="w-72 bg-white border-r p-6 flex flex-col gap-2 min-h-screen">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-500 mb-2">
          {userInfo?.firstName?.charAt(0) || 'U'}
        </div>
        <div className="font-semibold text-lg text-blue-700 mb-1">
          {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : ''}
        </div>
        <div className="text-xs text-gray-400">Tài khoản</div>
      </div>
      <nav className="flex flex-col gap-1">
        {sidebarItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.to}
            className={`flex items-center gap-3 px-4 py-2 rounded font-medium transition-colors ${location.pathname === item.to ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50 text-gray-700'}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center gap-3 px-4 py-2 rounded font-medium text-red-500 hover:bg-red-50 mt-4 ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FaSignOutAlt className="text-xl" />
          {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </button>
      </nav>
    </aside>
  );
};

export default UserSidebar; 