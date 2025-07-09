import express from "express";
import multer from 'multer';
import {
    listCity,
    addCity,
    removeCity,
    removePopularPlace,
    updateCity,
    getCityById
} from "../controllers/cityController.js";

const router = express.Router();

// Cấu hình multer để lưu file trong memory
const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        // Cho phép dummy file để đảm bảo multipart detection
        if (file.fieldname === 'dummy') {
            cb(null, true);
        } else if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
        }
    }
});

// Route public: lấy chi tiết thành phố theo ID (phải đặt trước các route khác)
router.get('/:cityId', getCityById);

// Routes cho thành phố
router.route('/')
    .get(listCity)
    .post(upload.any(), addCity); // Sử dụng upload.any() để xử lý nhiều loại file

// Routes admin cho thành phố cụ thể
router.delete('/:cityId', removeCity);
router.put('/:cityId', upload.any(), updateCity);

// Route xóa địa điểm nổi bật
router.route('/:cityId/popular-places/:placeId')
    .delete(removePopularPlace);

export default router; 