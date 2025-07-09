import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useCreateCityMutation } from '../../redux/api/cityApiSlice';

const CreateCity = () => {
    const navigate = useNavigate();
    const [popularPlaces, setPopularPlaces] = useState([]);
    const [images, setImages] = useState([]);
    const [popularQuestions, setPopularQuestions] = useState([{ Question: '', answer: '' }]);
    const [createCity, { isLoading }] = useCreateCityMutation();
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm();

    const handleAddPopularPlace = () => {
        setPopularPlaces([...popularPlaces, { name: '', description: '', image: null }]);
    };

    const handleRemovePopularPlace = (index) => {
        const newPlaces = [...popularPlaces];
        newPlaces.splice(index, 1);
        setPopularPlaces(newPlaces);
    };

    const handlePopularPlaceChange = (index, field, value) => {
        const newPlaces = [...popularPlaces];
        newPlaces[index][field] = value;
        setPopularPlaces(newPlaces);
    };

    const handlePopularPlaceImageChange = (index, file) => {
        const newPlaces = [...popularPlaces];
        newPlaces[index].image = file;
        setPopularPlaces(newPlaces);
    };

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        setImages([...images, ...files]);
    };

    const handleRemoveImage = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const handleAddPopularQuestion = () => {
        setPopularQuestions([...popularQuestions, { Question: '', answer: '' }]);
    };

    const handleRemovePopularQuestion = (index) => {
        const newQuestions = [...popularQuestions];
        newQuestions.splice(index, 1);
        setPopularQuestions(newQuestions);
    };

    const handlePopularQuestionChange = (index, field, value) => {
        const newQuestions = [...popularQuestions];
        newQuestions[index][field] = value;
        setPopularQuestions(newQuestions);
    };

    const onSubmit = async (data) => {
        try {
            // Validate required fields
            if (!images.length) {
                toast.error('Vui lòng thêm ít nhất một hình ảnh cho thành phố');
                return;
            }

            if (popularPlaces.length > 0) {
                const invalidPlaces = popularPlaces.filter(
                    place => !place.name || !place.description || !place.image
                );
                if (invalidPlaces.length > 0) {
                    toast.error('Vui lòng điền đầy đủ thông tin cho tất cả địa điểm nổi bật');
                    return;
                }
            }

            // Tạo FormData đúng chuẩn
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('bestTimeToVisit', data.bestTimeToVisit);
            images.forEach(file => {
                formData.append('images', file);
            });
            popularPlaces.forEach((place, idx) => {
                formData.append(`popularPlaces[${idx}].name`, place.name);
                formData.append(`popularPlaces[${idx}].description`, place.description);
                if (place.image) {
                    formData.append(`popularPlaces[${idx}].img`, place.image);
                }
            });
            popularQuestions.forEach((q, idx) => {
                if (q.Question && q.answer) {
                    formData.append(`popularQuestion[${idx}].Question`, q.Question);
                    formData.append(`popularQuestion[${idx}].answer`, q.answer);
                }
            });

            console.log(popularPlaces);

            // Gọi mutation createCity
            const result = await createCity(formData).unwrap();
            toast.success('Tạo thành phố thành công!');
            navigate('/admin/manage-city');
        } catch (error) {
            console.error('Create city error:', error);
            toast.error(error.data?.message || 'Có lỗi xảy ra khi tạo thành phố');
        }
    };

    return (
        <div className='bg-softBlue min-h-screen p-4 md:p-8'>
            <p className='font-semibold text-[20px] md:text-[24px]'>Thêm thành phố</p>
            <div className='bg-white rounded-lg shadow-md mt-4 p-4 md:p-6'>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label className="block font-medium mb-2">
                            Tên thành phố
                            <span className="text-red-500">*</span>
                        </label>
                        
                        <input
                            type="text"
                            placeholder="Nhập tên thành phố"
                            {...register('name', { required: "Tên thành phố là bắt buộc" })}
                            className={`w-full border p-2 rounded ${
                                errors['name'] ? "border-red-500" : "border-gray-300"
                            }`}
                        />
                        {errors["name"] && (
                            <p className="text-red-500 text-sm mt-1">{errors["name"]?.message}</p>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="block font-medium mb-2">
                            Mô tả
                            <span className="text-red-500">*</span>
                        </label>
                        
                        <textarea
                            rows={4}
                            placeholder="Nhập mô tả về thành phố"
                            {...register('description', { required: "Mô tả là bắt buộc" })}
                            className={`w-full border p-2 rounded ${
                                errors['description'] ? "border-red-500" : "border-gray-300"
                            }`}
                        />
                        {errors["description"] && (
                            <p className="text-red-500 text-sm mt-1">{errors["description"]?.message}</p>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="block font-medium mb-2">
                            Thời điểm tốt nhất để ghé thăm
                            <span className="text-red-500">*</span>
                        </label>
                        
                        <textarea
                            rows={3}
                            placeholder="Nhập thời điểm tốt nhất để ghé thăm"
                            {...register('bestTimeToVisit', { required: "Thời điểm ghé thăm là bắt buộc" })}
                            className={`w-full border p-2 rounded ${
                                errors['bestTimeToVisit'] ? "border-red-500" : "border-gray-300"
                            }`}
                        />
                        {errors["bestTimeToVisit"] && (
                            <p className="text-red-500 text-sm mt-1">{errors["bestTimeToVisit"]?.message}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block font-medium mb-2">
                            Hình ảnh thành phố
                            <span className="text-red-500">*</span>
                        </label>
                        
                        <div className="flex flex-wrap gap-4 mb-3">
                            {images.map((image, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={`city-${index}`}
                                        className="w-32 h-32 object-cover rounded"
                                    />
                                    <IconButton
                                        size="small"
                                        className="absolute top-1 right-1 bg-white"
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </div>
                            ))}
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<AddIcon />}
                                className="h-32 w-32"
                            >
                                Thêm ảnh
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </Button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block font-medium">
                                Địa điểm nổi bật
                            </label>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleAddPopularPlace}
                            >
                                Thêm địa điểm
                            </Button>
                        </div>

                        {popularPlaces.map((place, index) => (
                            <div key={index} className="border rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-medium">Địa điểm #{index + 1}</h3>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemovePopularPlace(index)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Tên địa điểm
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Nhập tên địa điểm"
                                            value={place.name}
                                            onChange={(e) => handlePopularPlaceChange(index, 'name', e.target.value)}
                                            className="w-full border border-gray-300 p-2 rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Mô tả
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="Nhập mô tả địa điểm"
                                            value={place.description}
                                            onChange={(e) => handlePopularPlaceChange(index, 'description', e.target.value)}
                                            className="w-full border border-gray-300 p-2 rounded"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Hình ảnh
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex items-center gap-4">
                                            {place.image && (
                                                <div className="relative">
                                                    <img
                                                        src={URL.createObjectURL(place.image)}
                                                        alt={place.name}
                                                        className="w-32 h-32 object-cover rounded"
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        className="absolute top-1 right-1 bg-white"
                                                        onClick={() => handlePopularPlaceImageChange(index, null)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </div>
                                            )}
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                startIcon={<AddIcon />}
                                                className={place.image ? "h-10" : "h-32 w-32"}
                                            >
                                                {place.image ? 'Thay đổi ảnh' : 'Thêm ảnh'}
                                                <input
                                                    type="file"
                                                    hidden
                                                    accept="image/*"
                                                    onChange={(e) => handlePopularPlaceImageChange(index, e.target.files[0])}
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block font-medium">
                                Câu hỏi phổ biến về thành phố
                            </label>
                            <Button
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={handleAddPopularQuestion}
                            >
                                Thêm câu hỏi
                            </Button>
                        </div>
                        {popularQuestions.map((q, idx) => (
                            <div key={idx} className="border rounded-lg p-4 mb-4 flex gap-4 items-center">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Câu hỏi"
                                        value={q.Question}
                                        onChange={e => handlePopularQuestionChange(idx, 'Question', e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded mb-2"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Trả lời"
                                        value={q.answer}
                                        onChange={e => handlePopularQuestionChange(idx, 'answer', e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded"
                                        required
                                    />
                                </div>
                                <IconButton size="small" color="error" onClick={() => handleRemovePopularQuestion(idx)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </div>
                        ))}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Thêm thành phố'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateCity; 