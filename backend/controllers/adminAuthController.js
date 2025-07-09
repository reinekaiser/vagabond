import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import response from '../utils/responseHandler.js';
import cloudinary from '../utils/cloudinary.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vagabond123';

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find admin user
        const admin = await User.findOne({ email, role: 'admin' });
        if (!admin) {
            return response(res, 401, false, 'Invalid credentials');
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return response(res, 401, false, 'Invalid credentials');
        }
        
        // Generate token
        const token = generateToken(admin);
        
        return response(res, 200, true, 'Login successful', {
            token,
            admin: {
                id: admin._id,
            email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return response(res, 500, false, 'Internal server error');
    }
};

const logoutAdmin = async (req, res) => {
    try {
        return response(res, 200, true, 'Logout successful');
    } catch (error) {
        console.error('Admin logout error:', error);
        return response(res, 500, false, 'Internal server error');
    }
};

const getAdminProfile = async (req, res) => {
    try {
        const admin = await User.findById(req.user.userId);
        if (!admin) {
            return response(res, 404, false, 'Admin not found');
        }

        return response(res, 200, true, 'Profile retrieved successfully', {
            admin: {
                id: admin._id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                phoneNumber: admin.phoneNumber,
                avatar: admin.avatar,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Get admin profile error:', error);
        return response(res, 500, false, 'Internal server error');
    }
};

const updateAdminProfile = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber } = req.body;
        const admin = await User.findById(req.user.userId);

        if (!admin) {
            return response(res, 404, false, 'Admin not found');
        }

        admin.firstName = firstName || admin.firstName;
        admin.lastName = lastName || admin.lastName;
        admin.phoneNumber = phoneNumber || admin.phoneNumber;

        await admin.save();

        return response(res, 200, true, 'Profile updated successfully', {
            admin: {
                id: admin._id,
                email: admin.email,
                firstName: admin.firstName,
                lastName: admin.lastName,
                phoneNumber: admin.phoneNumber,
                avatar: admin.avatar,
                role: admin.role
            }
        });
    } catch (error) {
        console.error('Update admin profile error:', error);
        return response(res, 500, false, 'Internal server error');
    }
};

const updateAdminAvatar = async (req, res) => {
    try {
        const { avatar } = req.body;
        const admin = await User.findById(req.user.userId);

        if (!admin) {
            return response(res, 404, false, 'Admin not found');
        }

        // Upload to Cloudinary if avatar is provided
        if (avatar) {
            const result = await cloudinary.uploader.upload(avatar, {
                folder: 'avatars',
                width: 150,
                crop: "scale"
            });
            admin.avatar = result.secure_url;
        }

        await admin.save();

        return response(res, 200, true, 'Avatar updated successfully', {
            admin: {
                id: admin._id,
                avatar: admin.avatar
            }
        });
    } catch (error) {
        console.error('Update admin avatar error:', error);
        return response(res, 500, false, 'Internal server error');
    }
};

const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await User.findById(req.user.userId);

        if (!admin) {
            return response(res, 404, false, 'Admin not found');
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return response(res, 401, false, 'Current password is incorrect');
        }

        // Hash new password
        admin.password = await bcrypt.hash(newPassword, 10);
        await admin.save();

        return response(res, 200, true, 'Password changed successfully');
    } catch (error) {
        console.error('Change admin password error:', error);
        return response(res, 500, false, 'Internal server error');
    }
};

export {
    loginAdmin,
    logoutAdmin,
    getAdminProfile,
    updateAdminProfile,
    updateAdminAvatar,
    changeAdminPassword
}; 