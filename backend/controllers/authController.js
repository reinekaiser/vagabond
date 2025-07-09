// RESTful API for Users
// Xác thực token của người dùng trước khi họ truy cập API
// Được sử dụng trong routes/userRoutes.js để bảo vệ API
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import response from '../utils/responseHandler.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const JWT_SECRET = process.env.JWT_SECRET || 'vagabond123';

const generateToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const registerUser = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phoneNumber } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!email || !password || !firstName || !lastName) {
            return response(res, 400, false, 'Missing required fields');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return response(res, 400, false, 'Email already registered');
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const user = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            // phoneNumber,
            role: 'user'
        });
        
        await user.save();
        
        // Generate token
        const token = generateToken(user);

        return response(res, 201, true, 'Registration successful', {
            token,
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profilePicture: user.profilePicture,
                token: token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return response(res, 500, false, 'Internal server error');
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return response(res, 401, false, 'Invalid credentials');
        }
        
        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return response(res, 401, false, 'Invalid credentials');
        }
        
        // Generate token
        const token = generateToken(user);
        
        return response(res, 200, true, 'Login successful', {
            token,
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profilePicture: user.profilePicture,
                token: token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return response(res, 500, false, 'Internal server error');
    }
};

const logoutUser = async (req, res) => {
    try {
        // In a JWT-based system, we don't need to do anything on the server side
        // The client should remove the token
        return response(res, 200, true, 'Logout successful');
    } catch (error) {
        console.error('Logout error:', error);
        return response(res, 500, false, 'Internal server error');
    }
};

const deleteAccount = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        return response(res, 200, true, 'Account deleted successfully');
    } catch (error) {
        console.error('Delete account error:', error);
        return response(res, 500, false, 'Internal server error');
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return response(res, 404, false, 'User not found');
        }

        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = verificationCode;
        user.verificationCodeExpires = Date.now() + 600000; // 10 minutes
        await user.save();

        // Log verification code in development mode
        console.log('=== DEVELOPMENT MODE ===');
        console.log('Verification code for', email, ':', verificationCode);
        console.log('=======================');

        // Configure nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME || process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || 'your-app-password'
            }
        });

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USERNAME || process.env.EMAIL_USER || 'your-email@gmail.com',
            to: email,
            subject: 'Mã xác thực đặt lại mật khẩu',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Đặt lại mật khẩu</h2>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu. Mã xác thực của bạn là:</p>
                    <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        ${verificationCode}
                    </div>
                    <p style="color: #666;">Mã này sẽ hết hạn sau 10 phút.</p>
                    <p style="color: #666;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                </div>
            `
        };

        try {
            await transporter.sendMail(mailOptions);
            return response(res, 200, true, 'Mã xác thực đã được gửi đến email của bạn', {
                verificationCode: process.env.NODE_ENV === 'development' ? verificationCode : undefined 
            });
        } catch (emailError) {
            console.error('Email send error:', emailError);
            // For development, still return success and log the code
            console.log('Verification code for', email, ':', verificationCode);
            return response(res, 200, true, 'Mã xác thực đã được gửi đến email của bạn (Email không gửi được, check console)', { 
                verificationCode: verificationCode // Always return in development when email fails
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        return response(res, 500, false, 'Internal server error');
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        if (!email || !code || !newPassword) {
            return response(res, 400, false, 'Missing required fields');
        }

        // Find user with valid verification code
        const user = await User.findOne({
            email,
            verificationCode: code,
            verificationCodeExpires: { $gt: Date.now() }
        });

        if (!user) {
            return response(res, 400, false, 'Mã xác thực không hợp lệ hoặc đã hết hạn');
        }

        // Update password
        user.password = await bcrypt.hash(newPassword, 10);
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        return response(res, 200, true, 'Đặt lại mật khẩu thành công');
    } catch (error) {
        console.error('Reset password error:', error);
        return response(res, 500, false, 'Internal server error');
    }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Cập nhật thông tin user
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, gender, dateOfBirth, city, phoneNumber, nationality } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy user' });
    user.firstName = firstName;
    user.lastName = lastName;
    user.gender = gender;
    user.dateOfBirth = dateOfBirth;
    user.city = city;
    user.phoneNumber = phoneNumber;
    user.nationality = nationality;
    await user.save();
    res.json({ success: true, message: 'Cập nhật thông tin thành công', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Lấy thông tin user theo ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password -verificationCode -verificationCodeExpires -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return response(res, 404, false, 'Không tìm thấy user');
    }

    return response(res, 200, true, 'Lấy thông tin user thành công', { user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return response(res, 500, false, 'Lỗi server');
  }
};

export {
    registerUser,
    loginUser,
    logoutUser,
    deleteAccount,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    getUserById
};


