import mongoose from "mongoose";
import City from "../models/city.js";
import cloudinary from "../utils/cloudinary.js";
import multer from 'multer';
import { Readable } from 'stream';

const bufferToStream = (buffer) => {
    return new Readable({
        read() {
            this.push(buffer);
            this.push(null);
        },
    });
};

// Hàm upload file lên Cloudinary
const uploadToCloudinary = (file, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: folder },
            (error, result) => {
                if (error) {
                    console.log('Upload to Cloudinary failed:', error);
                    reject(error);
                } else {
                    console.log('Upload to Cloudinary successful:', result.secure_url);
                    resolve(result.secure_url);
                }
            }
        );
        bufferToStream(file.buffer).pipe(stream);
    });
};

// Cấu hình multer để lưu file trong memory
const upload = multer({ storage: multer.memoryStorage() });

const listCity = async(req, res) => {
    try {
        const cities = await City.find({});
        res.status(200).json({
            success: true,
            data: cities
        });
    } catch(error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi server",
            error: error.message 
        });
    }
}

const addCity = async(req, res) => {
    try {
        console.log('--- [addCity] req.files:', req.files);
        console.log('--- [addCity] req.body:', req.body);
        const { name, description, bestTimeToVisit } = req.body;
        
        // Validate required fields
        if (!name || !description || !bestTimeToVisit) {
            return res.status(400).json({ 
                success: false,
                message: "Vui lòng điền đầy đủ thông tin bắt buộc" 
            });
        }
        
        const existingCity = await City.findOne({ name });
        if (existingCity) {
            return res.status(400).json({ 
                success: false,
                message: "Thành phố đã tồn tại" 
            });
        }

        // Upload hình ảnh thành phố lên Cloudinary
        const cityImages = [];
        const cityImageFiles = req.files ? req.files.filter(file => file.fieldname === 'images') : [];
        if (cityImageFiles.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Không tìm thấy file ảnh với fieldname 'images' trong req.files"
            });
        }
        for (const file of cityImageFiles) {
            const imageUrl = await uploadToCloudinary(file, 'cities');
            cityImages.push(imageUrl);
        }

        // Xử lý địa điểm nổi bật
        const popularPlaces = [];
        const popularPlaceData = {};

        // Lấy tất cả các trường của địa điểm nổi bật từ formData
        Object.keys(req.body).forEach(key => {
            // Thay đổi pattern để khớp với format từ frontend: popularPlaces[0].name
            const match = key.match(/popularPlaces\[(\d+)\]\.(\w+)/);
            if (match) {
                const [, index, field] = match;
                if (!popularPlaceData[index]) {
                    popularPlaceData[index] = {};
                }
                popularPlaceData[index][field] = req.body[key];
            }
        });

        // Upload và xử lý hình ảnh cho từng địa điểm nổi bật
        if (req.files) {
            const popularPlaceFiles = req.files.filter(file => 
                file.fieldname.startsWith('popularPlaces') && file.fieldname.includes('.img')
            );
            
            for (const file of popularPlaceFiles) {
                const match = file.fieldname.match(/popularPlaces\[(\d+)\]\.img/);
                if (match) {
                    const index = match[1];
                    const imageUrl = await uploadToCloudinary(file, 'popular-places');
                    if (popularPlaceData[index]) {
                        popularPlaceData[index].img = imageUrl;
                    }
                }
            }
        }

        // Chuyển đổi dữ liệu địa điểm nổi bật thành mảng và validate
        for (const index in popularPlaceData) {
            const place = popularPlaceData[index];
            if (place.name && place.description) {
                popularPlaces.push({
                    name: place.name,
                    description: place.description,
                    img: place.img || null 
                });
            }
        }

        // Xử lý câu hỏi phổ biến
        const popularQuestions = [];
        const popularQuestionData = {};
        Object.keys(req.body).forEach(key => {
            const match = key.match(/popularQuestion\[(\d+)\]\.(\w+)/);
            if (match) {
                const [, index, field] = match;
                if (!popularQuestionData[index]) popularQuestionData[index] = {};
                popularQuestionData[index][field] = req.body[key];
            }
        });
        for (const index in popularQuestionData) {
            const q = popularQuestionData[index];
            if (q.Question && q.answer) {
                popularQuestions.push({ Question: q.Question, answer: q.answer });
            }
        }

        const newCity = new City({
            name, 
            description, 
            bestTimeToVisit,
            popularPlace: popularPlaces,
            img: cityImages,
            popularQuestion: popularQuestions
        });

        await newCity.save();
        console.log('City saved successfully with popular places:', newCity); 

        res.status(201).json({
            success: true,
            message: "Tạo thành phố thành công",
            data: newCity
        });
    } catch(error) {
        console.error('Error in addCity:', error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi server",
            error: error.message 
        });
    }
}

const addPopularPlace = async(req, res) => {
    try {
        const { cityId } = req.params;
        const { name, description } = req.body;

        const city = await City.findById(cityId);
        if (!city) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy thành phố" 
            });
        }

        // Upload hình ảnh lên Cloudinary
        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file, 'popular-places');
        }

        city.popularPlace.push({
            name,
            description,
            img: imageUrl
        });

        await city.save();
        console.log('Popular place added successfully'); 

        res.status(201).json({
            success: true,
            message: "Thêm địa điểm nổi tiếng thành công",
            data: city
        });
    } catch(error) {
        console.log('Error in addPopularPlace:', error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi server",
            error: error.message 
        });
    }
}

const removeCity = async (req, res) => {
    try {
        const { cityId } = req.params;

        const city = await City.findById(cityId);
        if (!city) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy thành phố" 
            });
        }

        // TODO: Xóa ảnh từ Cloudinary trước khi xóa city

        await City.findByIdAndDelete(cityId);
        
        res.status(200).json({ 
            success: true,
            message: "Xóa thành phố thành công" 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi server",
            error: error.message 
        });
    }
};

const removePopularPlace = async (req, res) => {
    try {
        const { cityId, placeId } = req.params;

        const city = await City.findById(cityId);
        if (!city) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy thành phố" 
            });
        }

        // TODO: Xóa ảnh từ Cloudinary trước khi xóa địa điểm

        city.popularPlace = city.popularPlace.filter(
            place => place._id.toString() !== placeId
        );

        await city.save();

        res.status(200).json({
            success: true,
            message: "Xóa địa điểm nổi tiếng thành công"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Lỗi server",
            error: error.message
        });
    }
};

const updateCity = async (req, res) => {
    try {
        const { cityId } = req.params;
        console.log('=== UPDATE CITY BACKEND DEBUG ===');
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);
        console.log('req.is multipart?', req.is('multipart/form-data'));
        
        // Kiểm tra xem có phải multipart/form-data không (có thể có hoặc không có files)
        const isMultipart = req.is('multipart/form-data') || req.files !== undefined;
        
        if (isMultipart) {
            console.log('Processing as multipart/form-data');
            // Lấy các trường text từ req.body
            const { name, description, bestTimeToVisit } = req.body;
            
            // Xử lý ảnh city
            let cityImages = [];
            
            // Upload ảnh mới nếu có
            const cityImageFiles = req.files ? req.files.filter(file => file.fieldname === 'images') : [];
            for (const file of cityImageFiles) {
                const imageUrl = await uploadToCloudinary(file, 'cities');
                cityImages.push(imageUrl);
            }
            
            // Giữ lại ảnh cũ nếu có trong req.body.oldImages
            if (req.body.oldImages) {
                console.log('Found oldImages:', req.body.oldImages);
                if (Array.isArray(req.body.oldImages)) {
                    cityImages = [...cityImages, ...req.body.oldImages];
                } else {
                    cityImages.push(req.body.oldImages);
                }
            }
            
            console.log('Final cityImages:', cityImages);
            
            // Xử lý popularPlace
            const popularPlaces = [];
            const popularPlaceData = {};
            Object.keys(req.body).forEach(key => {
                const match = key.match(/popularPlaces\[(\d+)\]\.(\w+)/);
                if (match) {
                    const [, index, field] = match;
                    if (!popularPlaceData[index]) popularPlaceData[index] = {};
                    popularPlaceData[index][field] = req.body[key];
                }
            });
            
            // Xử lý ảnh popularPlace
            const popularPlaceFiles = req.files ? req.files.filter(file => file.fieldname.startsWith('popularPlaces') && file.fieldname.includes('.img')) : [];
            for (const file of popularPlaceFiles) {
                const match = file.fieldname.match(/popularPlaces\[(\d+)\]\.img/);
                if (match) {
                    const index = match[1];
                    const imageUrl = await uploadToCloudinary(file, 'popular-places');
                    if (popularPlaceData[index]) popularPlaceData[index].img = imageUrl;
                }
            }
            
            // Giữ lại ảnh cũ nếu có
            Object.keys(popularPlaceData).forEach(idx => {
                if (popularPlaceData[idx].oldImg && !popularPlaceData[idx].img) {
                    popularPlaceData[idx].img = popularPlaceData[idx].oldImg;
                }
            });
            
            // Build popularPlaces array
            for (const index in popularPlaceData) {
                const place = popularPlaceData[index];
                if (place.name && place.description) {
                    popularPlaces.push({
                        name: place.name,
                        description: place.description,
                        img: place.img || null
                    });
                }
            }
            
            // Xử lý popularQuestion
            const popularQuestions = [];
            const popularQuestionData = {};
            Object.keys(req.body).forEach(key => {
                const match = key.match(/popularQuestion\[(\d+)\]\.(\w+)/);
                if (match) {
                    const [, index, field] = match;
                    if (!popularQuestionData[index]) popularQuestionData[index] = {};
                    popularQuestionData[index][field] = req.body[key];
                }
            });
            for (const index in popularQuestionData) {
                const q = popularQuestionData[index];
                if (q.Question && q.answer) {
                    popularQuestions.push({ Question: q.Question, answer: q.answer });
                }
            }
            
            // Cập nhật city
            const city = await City.findById(cityId);
            if (!city) return res.status(404).json({ success: false, message: 'Không tìm thấy thành phố' });
            
            console.log('Old city images:', city.img);
            console.log('New city images:', cityImages);
            
            city.name = name;
            city.description = description;
            city.bestTimeToVisit = bestTimeToVisit;
            city.img = cityImages;
            city.popularPlace = popularPlaces;
            city.popularQuestion = popularQuestions;
            await city.save();
            
            console.log('City updated successfully');
            console.log('=== END BACKEND DEBUG ===');
            
            return res.status(200).json({ success: true, message: 'Cập nhật thành phố thành công', data: city });
        }
        
        // Nếu là object thường (không có file)
        const { name, description, bestTimeToVisit, popularPlace, popularQuestion } = req.body;
        // Validate required fields
        if (!name || !description || !bestTimeToVisit) {
            return res.status(400).json({ 
                success: false,
                message: "Vui lòng điền đầy đủ thông tin bắt buộc" 
            });
        }
        // Kiểm tra thành phố tồn tại
        const city = await City.findById(cityId);
        if (!city) {
            return res.status(404).json({ 
                success: false,
                message: "Không tìm thấy thành phố" 
            });
        }
        // Kiểm tra tên thành phố đã tồn tại (nếu đổi tên)
        if (name !== city.name) {
            const existingCity = await City.findOne({ name });
            if (existingCity) {
                return res.status(400).json({ 
                    success: false,
                    message: "Tên thành phố đã tồn tại" 
                });
            }
        }
        // Cập nhật thông tin cơ bản
        city.name = name;
        city.description = description;
        city.bestTimeToVisit = bestTimeToVisit;
        // Cập nhật địa điểm nổi bật nếu có
        if (popularPlace && Array.isArray(popularPlace)) {
            // Validate thông tin của các địa điểm nổi bật
            const invalidPlaces = popularPlace.filter(
                place => !place.name?.trim() || !place.description?.trim()
            );
            if (invalidPlaces.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Thông tin địa điểm nổi bật không hợp lệ"
                });
            }
            city.popularPlace = popularPlace.map(place => ({
                name: place.name.trim(),
                description: place.description.trim(),
                img: place.img || null
            }));
        }
        // Cập nhật popularQuestion nếu có
        if (popularQuestion && Array.isArray(popularQuestion)) {
            const invalidQuestions = popularQuestion.filter(
                q => !q.Question?.trim() || !q.answer?.trim()
            );
            if (invalidQuestions.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Thông tin câu hỏi phổ biến không hợp lệ"
                });
            }
            city.popularQuestion = popularQuestion.map(q => ({
                Question: q.Question.trim(),
                answer: q.answer.trim()
            }));
        }
        await city.save();
        res.status(200).json({
            success: true,
            message: "Cập nhật thành phố thành công",
            data: city
        });
    } catch (error) {
        console.error('Error in updateCity:', error);
        res.status(500).json({ 
            success: false,
            message: "Lỗi server",
            error: error.message 
        });
    }
};

// Lấy thông tin chi tiết thành phố theo id
const getCityById = async (req, res) => {
    try {
        const { cityId } = req.params;
        const city = await City.findById(cityId);
        if (!city) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thành phố' });
        }
        res.status(200).json({ success: true, data: city });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
    }
};

export {
    listCity,
    addCity,
    addPopularPlace,
    removeCity,
    removePopularPlace,
    updateCity,
    getCityById
};