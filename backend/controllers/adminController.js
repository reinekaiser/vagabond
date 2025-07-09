import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs';

const getProfile = async (req, res) => {
    try {
        console.log('Getting admin profile');
        // Lấy admin đầu tiên trong database (role: 'admin')
        const admin = await User.findOne({ role: 'admin' }).select('-password');
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin admin'
            });
        }

        // Map phoneNumber to phone for frontend compatibility
        const adminData = {
            ...admin.toObject(),
            phone: admin.phoneNumber  // Map phoneNumber to phone
        };

        res.json({
            success: true,
            data: adminData
        });
    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { username, email, phone, phoneNumber, nationality, city } = req.body;
        
        console.log('Update profile request:', req.body);
        
        const admin = await User.findOne({ role: 'admin' }).select('-password');
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin admin'
            });
        }

        // Update fields - use phone or phoneNumber (frontend sends 'phone')
        admin.username = username || admin.username;
        admin.email = email || admin.email;
        admin.phoneNumber = phone || phoneNumber || admin.phoneNumber;
        admin.nationality = nationality || admin.nationality;
        admin.city = city || admin.city;

        const updatedAdmin = await admin.save();
        
        console.log('Admin updated successfully:', {
            username: updatedAdmin.username,
            email: updatedAdmin.email,
            phoneNumber: updatedAdmin.phoneNumber,
            nationality: updatedAdmin.nationality,
            city: updatedAdmin.city
        });

        res.json({
            success: true,
            data: {
                ...updatedAdmin.toObject(),
                password: undefined,
                phone: updatedAdmin.phoneNumber  // Map phoneNumber to phone for frontend
            },
            message: 'Cập nhật thông tin thành công'
        });
    } catch (error) {
        console.error('Error in updateProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

const uploadAvatar = async (req, res) => {
    try {
        console.log('Upload avatar request received');
        const admin = await User.findOne({ role: 'admin' }).select('-password');
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin admin'
            });
        }
        // Check file
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn ảnh để tải lên'
            });
        }
        console.log('File information:', {
            filename: req.file.filename,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
        try {
            // Upload to cloudinary
            const result = await cloudinary.uploader.upload(req.file.path);
            console.log('Cloudinary upload result:', result);
            admin.avatar = result.secure_url;
            admin.profilePicture = result.secure_url;
            await admin.save();
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
                console.log('Temporary file deleted');
            }
            return res.json({
                success: true,
                data: {
                    avatar: result.secure_url
                },
                message: 'Tải ảnh đại diện thành công'
            });
        } catch (cloudinaryError) {
            console.error('Cloudinary upload error:', cloudinaryError);
            return res.status(500).json({
                success: false,
                message: 'Lỗi khi tải ảnh lên dịch vụ lưu trữ'
            });
        }
    } catch (error) {
        console.error('Error in uploadAvatar:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server khi xử lý avatar'
        });
    }
};

const changePassword = async (req, res) => {
    try {
        console.log('Change password request received:', req.body);
        const { currentPassword, newPassword, confirmPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới'
            });
        }
        // Cần lấy cả trường password để so sánh
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông tin admin'
            });
        }
        console.log('Admin found, comparing passwords');
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu hiện tại không đúng'
            });
        }
        console.log('Current password matched, updating to new password');
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu mới không khớp'
            });
        }
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        await admin.save();
        console.log('Password updated successfully');
        res.json({
            success: true,
            message: 'Đổi mật khẩu thành công'
        });
    } catch (error) {
        console.error('Error in changePassword:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

export { getProfile, updateProfile, uploadAvatar, changePassword };

export default {
    getProfile,
    updateProfile,
    uploadAvatar,
    changePassword
}; 