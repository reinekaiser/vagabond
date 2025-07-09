// Tạo JWT token (JSON Web Token) để xác thực người dùng trong hệ thống RESTful API
import jwt from 'jsonwebtoken';

// Sử dụng biến JWT_SECRET từ .env hoặc dùng giá trị mặc định
const JWT_SECRET = process.env.JWT_SECRET || 'vagabond123';

// Log thông báo nếu đang sử dụng giá trị mặc định (chỉ dùng trong development)
if (!process.env.JWT_SECRET) {
    console.warn('WARNING: Using default JWT_SECRET. This is insecure for production!');
}

const generateToken = (user) => {
    return jwt.sign({
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
    }, JWT_SECRET, {
        expiresIn: '90d',
    });
};

export { generateToken };