import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import response from '../utils/responseHandler.js';

const updateAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const adminId = req.admin.userId;
        
        if (!currentPassword || !newPassword) {
            return response(res, 400, 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới');
        }
        
        if (newPassword.length < 6) {
            return response(res, 400, 'Mật khẩu mới phải có ít nhất 6 ký tự');
        }
        
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return response(res, 404, 'Không tìm thấy tài khoản admin');
        }
        
        // Verify current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, admin.password);
        if (!isPasswordCorrect) {
            return response(res, 400, 'Mật khẩu hiện tại không chính xác');
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        admin.password = hashedPassword;
        await admin.save();
        
        return response(res, 200, 'Cập nhật mật khẩu thành công');
    } catch (error) {
        return response(res, 500, 'Cập nhật mật khẩu thất bại', error.message);
    }
};

export { updateAdminPassword }; 