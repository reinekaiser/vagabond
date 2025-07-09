import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  PencilIcon,
  CameraIcon,
  LockClosedIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useUpdateAdminAvatarMutation,
  useUpdateAdminPasswordMutation
} from '../../redux/api/adminApiSlice';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/features/authSlice';
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data: adminData, isLoading: isLoadingProfile } = useGetAdminProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateAdminProfileMutation();
  const [updateAvatar, { isLoading: isUpdatingAvatar }] = useUpdateAdminAvatarMutation();
  const [updatePassword, { isLoading: isUpdatingPassword }] = useUpdateAdminPasswordMutation();

  const [openEdit, setOpenEdit] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [editData, setEditData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (adminData) {
      setEditData(adminData);
    }
  }, [adminData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    navigate('/sign-in');
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File ảnh không được vượt quá 5MB');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        await updateAvatar(formData).unwrap();
        toast.success('Cập nhật avatar thành công');
      } catch (error) {
        toast.error(error.data?.message || 'Có lỗi xảy ra khi cập nhật avatar');
      }
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(editData).unwrap();
      toast.success('Cập nhật thông tin thành công');
      setOpenEdit(false);
    } catch (error) {
      toast.error(error.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      }).unwrap();

      toast.success('Đổi mật khẩu thành công');
      setOpenPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-ping"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center text-center md:text-left">
            {/* Avatar Section */}
            <div className="relative group mb-6 md:mb-0 md:mr-8">
              <div className="relative">
                <img
                  src={adminData?.avatar || adminData?.profilePicture || '/default-avatar.png'}
                  alt={adminData?.username}
                  className="w-32 h-32 rounded-full border-4 border-white/30 shadow-lg object-cover transition-transform group-hover:scale-105"
                />
                <label className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:scale-110">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isUpdatingAvatar}
                  />
                  {isUpdatingAvatar ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <CameraIcon className="w-5 h-5" />
                  )}
                </label>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {adminData?.username || 'Admin'}
              </h1>
              <div className="flex items-center justify-center md:justify-start mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm">
                  <UserIcon className="w-4 h-4 mr-2" />
                  {adminData?.role || 'Administrator'}
                </span>
              </div>
              <p className="text-blue-100 mb-6 max-w-md">
                Quản lý hệ thống du lịch và điều hành các hoạt động kinh doanh
              </p>
              
              <button
                onClick={() => setOpenEdit(true)}
                disabled={isUpdatingProfile}
                className="inline-flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 disabled:opacity-50"
              >
                <PencilIcon className="w-5 h-5 mr-2" />
                {isUpdatingProfile ? 'Đang cập nhật...' : 'Chỉnh sửa thông tin'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-100 rounded-xl mr-4">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="flex items-center text-sm font-medium text-gray-600 mb-2">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Tên đăng nhập
                  </label>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 group-hover:border-blue-300 transition-colors">
                    <p className="text-gray-800 font-medium">{adminData?.username || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center text-sm font-medium text-gray-600 mb-2">
                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                    Email
                  </label>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 group-hover:border-blue-300 transition-colors">
                    <p className="text-gray-800 font-medium">{adminData?.email || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center text-sm font-medium text-gray-600 mb-2">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    Số điện thoại
                  </label>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 group-hover:border-blue-300 transition-colors">
                    <p className="text-gray-800 font-medium">{adminData?.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="group">
                  <label className="flex items-center text-sm font-medium text-gray-600 mb-2">
                    <GlobeAltIcon className="w-4 h-4 mr-2" />
                    Quốc tịch
                  </label>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 group-hover:border-blue-300 transition-colors">
                    <p className="text-gray-800 font-medium">{adminData?.nationality || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="group md:col-span-2">
                  <label className="flex items-center text-sm font-medium text-gray-600 mb-2">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    Thành phố
                  </label>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 group-hover:border-blue-300 transition-colors">
                    <p className="text-gray-800 font-medium">{adminData?.city || 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Security Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-green-100 rounded-xl mr-4">
                  <LockClosedIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Bảo mật</h3>
              </div>

              <button
                onClick={() => setOpenPassword(true)}
                disabled={isUpdatingPassword}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <LockClosedIcon className="w-5 h-5 mr-2" />
                {isUpdatingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
              </button>
            </div>

            {/* Logout */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-red-100 rounded-xl mr-4">
                  <ArrowRightOnRectangleIcon className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Tài khoản</h3>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                Đăng xuất
              </button>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Thống kê nhanh</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Đăng nhập lần cuối</span>
                  <span className="font-medium">Hôm nay</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Trạng thái</span>
                  <span className="inline-flex items-center px-2 py-1 bg-green-500 rounded-full text-xs">
                    <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {openEdit && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center">
                    <PencilIcon className="w-6 h-6 mr-3" />
                    <h3 className="text-xl font-bold">Cập nhật thông tin</h3>
                  </div>
                  <button
                    onClick={() => setOpenEdit(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên đăng nhập
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={editData?.username || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập tên đăng nhập"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={editData?.email || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editData?.phone || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quốc tịch
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={editData?.nationality || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập quốc tịch"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thành phố
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={editData?.city || ''}
                      onChange={handleEditChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Nhập thành phố"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setOpenEdit(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isUpdatingProfile ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Đang lưu...
                      </div>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {openPassword && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center">
                    <LockClosedIcon className="w-6 h-6 mr-3" />
                    <h3 className="text-xl font-bold">Đổi mật khẩu</h3>
                  </div>
                  <button
                    onClick={() => setOpenPassword(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu hiện tại
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Nhập mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Xác nhận mật khẩu mới"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {passwordData.newPassword && passwordData.confirmPassword && (
                    <div className="flex items-center text-sm">
                      {passwordData.newPassword === passwordData.confirmPassword ? (
                        <div className="flex items-center text-green-600">
                          <CheckIcon className="w-4 h-4 mr-2" />
                          Mật khẩu khớp
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                          Mật khẩu không khớp
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setOpenPassword(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={isUpdatingPassword || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isUpdatingPassword ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Đang cập nhật...
                      </div>
                    ) : (
                      'Đổi mật khẩu'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
