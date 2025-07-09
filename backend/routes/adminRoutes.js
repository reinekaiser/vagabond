import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { loginAdmin, logoutAdmin } from '../controllers/adminAuthController.js';
import { getProfile, updateProfile, uploadAvatar, changePassword } from '../controllers/adminController.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Cấu hình multer để upload avatar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Tạo tên file duy nhất với timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadMiddleware = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
    },
    fileFilter: function (req, file, cb) {
        // Chỉ cho phép upload ảnh
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép upload file ảnh!'), false);
        }
    }
}).single('avatar');

// Error handling middleware cho multer
const handleUpload = (req, res, next) => {
    uploadMiddleware(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({
                success: false,
                message: `Lỗi upload file: ${err.message}`
            });
        } else if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        // Debug thông tin request
        console.log('Upload request received:');
        console.log('Request headers:', req.headers);
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        
        // Không có lỗi, tiếp tục
        next();
    });
};

// Auth routes
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);

// Protected routes
router.use(protect);
router.use(admin);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/avatar', handleUpload, uploadAvatar);
router.post('/change-password', changePassword);

export default router; 