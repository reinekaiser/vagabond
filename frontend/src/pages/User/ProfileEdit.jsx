import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEdit, FaSave, FaEye, FaEyeSlash, FaCalendarAlt, FaMapMarkerAlt, FaEnvelope, FaPhone, FaFlag, FaVenus, FaMars } from 'react-icons/fa';

const GENDERS = [
  { value: '', label: 'Chọn giới tính' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ProfileEdit = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    city: '',
    email: '',
    phoneNumber: '',
    nationality: ''
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy dữ liệu user từ localStorage hoặc API
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
        city: user.city || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        nationality: user.nationality || ''
      });
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Cập nhật thông tin thất bại');
      }
      
      // Cập nhật lại localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...data.user }));
      
      toast.success(data.message || 'Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Cập nhật thông tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/sign-in';
  };

  const ChangePasswordForm = () => {
    const [passwordForm, setPasswordForm] = useState({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
      old: false,
      new: false,
      confirm: false
    });

    const handlePasswordChange = (e) => {
      setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const togglePassword = (field) => {
      setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordSubmit = async (e) => {
      e.preventDefault();
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp');
        return;
      }
      setPasswordLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/users/change-password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            oldPassword: passwordForm.oldPassword, 
            newPassword: passwordForm.newPassword 
          })
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Đổi mật khẩu thất bại');
        }
        
        toast.success(data.message || 'Đổi mật khẩu thành công!');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } catch (err) {
        console.error('Error changing password:', err);
        toast.error(err.message || 'Đổi mật khẩu thất bại');
      } finally {
        setPasswordLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <FaLock className="text-yellow-600" />
            <span className="font-medium">Bảo mật tài khoản</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Hãy sử dụng mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaLock className="text-gray-400" />
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPasswords.old ? "text" : "password"}
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
              <button
                type="button"
                onClick={() => togglePassword('old')}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.old ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaLock className="text-gray-400" />
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Nhập mật khẩu mới"
                required
              />
              <button
                type="button"
                onClick={() => togglePassword('new')}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaLock className="text-gray-400" />
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Nhập lại mật khẩu mới"
                required
              />
              <button
                type="button"
                onClick={() => togglePassword('confirm')}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FaSave className="text-sm" />
              {passwordLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                {form.firstName?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Cài đặt tài khoản</h1>
                <p className="text-blue-100">Quản lý thông tin cá nhân và bảo mật</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex border-b border-gray-200">
              <button
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'profile' 
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-blue-500 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser className="text-sm" />
                Thông tin cá nhân
              </button>
              <button
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'security' 
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-blue-500 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <FaLock className="text-sm" />
                Mật khẩu & Bảo mật
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'profile' && (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Name Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FaEdit className="text-blue-500" />
                      Thông tin cơ bản
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FaUser className="text-gray-400" />
                          Họ
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Nhập họ"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FaUser className="text-gray-400" />
                          Tên
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Nhập tên"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          {form.gender === 'male' ? <FaMars className="text-blue-500" /> : 
                           form.gender === 'female' ? <FaVenus className="text-pink-500" /> : 
                           <FaUser className="text-gray-400" />}
                          Giới tính
                        </label>
                        <select
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          {GENDERS.map(g => (
                            <option key={g.value} value={g.value}>{g.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FaCalendarAlt className="text-gray-400" />
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={form.dateOfBirth}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-green-500" />
                      Thông tin địa chỉ
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FaMapMarkerAlt className="text-gray-400" />
                          Thành phố cư trú
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Nhập thành phố"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FaFlag className="text-gray-400" />
                          Quốc tịch
                        </label>
                        <input
                          type="text"
                          name="nationality"
                          value={form.nationality}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Nhập quốc tịch"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FaEnvelope className="text-purple-500" />
                      Thông tin liên hệ
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FaEnvelope className="text-gray-400" />
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          disabled
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed"
                          placeholder="Email không thể thay đổi"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <FaPhone className="text-gray-400" />
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          name="phoneNumber"
                          value={form.phoneNumber}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                      onClick={() => window.history.back()}
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <FaSave className="text-sm" />
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </form>
              )}
              
              {activeTab === 'security' && <ChangePasswordForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit; 