import React, { useState, useEffect } from 'react';
import { IoSearch } from "react-icons/io5";
import { IoMdAddCircleOutline, IoMdRefresh } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useGetCitiesQuery, useDeleteCityMutation, useUpdateCityMutation } from '../../redux/api/cityApiSlice';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, TextField, IconButton, Divider } from '@mui/material';
import { toast } from 'react-toastify';
import CityCard from './CityCard';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const ManageCity = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [searched, setSearched] = useState(false);
    const [filteredResults, setFilteredResults] = useState([]);
    const { data: citiesResponse, isLoading, error, refetch } = useGetCitiesQuery();
    const [deleteCity, { isLoading: isDeleting }] = useDeleteCityMutation();
    const [updateCity, { isLoading: isUpdating }] = useUpdateCityMutation();

    // State cho dialog xác nhận xóa
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [cityToDelete, setCityToDelete] = useState(null);

    // State cho modal chỉnh sửa
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingCity, setEditingCity] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        bestTimeToVisit: '',
        popularPlaces: [],
        popularQuestions: []
    });

    // 1. Thêm state cho ảnh thành phố và ảnh địa điểm nổi bật khi chỉnh sửa
    const [editImages, setEditImages] = useState([]);
    const [editPopularPlacesImages, setEditPopularPlacesImages] = useState([]); // [{image: File|null}]

    useEffect(() => {
        if (editingCity) {
            setEditForm({
                name: editingCity.name || '',
                description: editingCity.description || '',
                bestTimeToVisit: editingCity.bestTimeToVisit || '',
                popularPlaces: editingCity.popularPlace || [],
                popularQuestions: editingCity.popularQuestion || []
            });
            setEditImages(editingCity.img || []);
            setEditPopularPlacesImages(
                (editingCity.popularPlace || []).map(place => ({ image: null, oldImg: place.img || null }))
            );
        }
    }, [editingCity]);

    // Xử lý tìm kiếm
    useEffect(() => {
        if (!search.trim() || !citiesResponse) {
            setFilteredResults([]);
            setSearched(false);
            return;
        }

        const searchTerm = search.trim().toLowerCase();
        const cities = Array.isArray(citiesResponse.data) ? citiesResponse.data : 
                      Array.isArray(citiesResponse) ? citiesResponse : [];
        
        const results = cities.filter(city => {
            const cityName = city?.name?.toLowerCase() || '';
            return cityName.includes(searchTerm);
        });

        setFilteredResults(results);
        setSearched(true);
    }, [search, citiesResponse]);

    const handleSearch = (e) => {
        e?.preventDefault();
        if (!search.trim()) {
            setSearched(false);
            setFilteredResults([]);
        } else {
            setSearched(true);
        }
    };

    // Xử lý mở modal chỉnh sửa
    const handleOpenEditModal = (city) => {
        setEditingCity(city);
        setEditModalOpen(true);
    };

    // Xử lý đóng modal chỉnh sửa
    const handleCloseEditModal = () => {
        setEditModalOpen(false);
        setEditingCity(null);
        setEditForm({
            name: '',
            description: '',
            bestTimeToVisit: '',
            popularPlaces: [],
            popularQuestions: []
        });
    };

    // Thêm handlers cho popular places
    const handleAddPopularPlace = () => {
        setEditForm({
            ...editForm,
            popularPlaces: [
                ...editForm.popularPlaces,
                { name: '', description: '' }
            ]
        });
    };

    const handleRemovePopularPlace = (index) => {
        const newPlaces = [...editForm.popularPlaces];
        newPlaces.splice(index, 1);
        setEditForm({
            ...editForm,
            popularPlaces: newPlaces
        });
    };

    const handlePopularPlaceChange = (index, field, value) => {
        const newPlaces = [...editForm.popularPlaces];
        newPlaces[index] = {
            ...newPlaces[index],
            [field]: value
        };
        setEditForm({
            ...editForm,
            popularPlaces: newPlaces
        });
    };

    // 3. Thêm handler cho upload/xóa ảnh thành phố và địa điểm nổi bật
    const handleEditImageUpload = (event) => {
        const files = Array.from(event.target.files);
        setEditImages([...editImages, ...files]);
    };
    const handleRemoveEditImage = (index) => {
        const newImages = [...editImages];
        newImages.splice(index, 1);
        setEditImages(newImages);
    };
    const handleEditPopularPlaceImageChange = (index, file) => {
        const newPlaces = [...editPopularPlacesImages];
        newPlaces[index] = { ...newPlaces[index], image: file };
        setEditPopularPlacesImages(newPlaces);
    };
    const handleRemoveEditPopularPlaceImage = (index) => {
        const newPlaces = [...editPopularPlacesImages];
        newPlaces[index] = { ...newPlaces[index], image: null, oldImg: null };
        setEditPopularPlacesImages(newPlaces);
    };

    // Thêm handlers cho popular questions
    const handleAddPopularQuestion = () => {
        setEditForm({
            ...editForm,
            popularQuestions: [
                ...editForm.popularQuestions,
                { Question: '', answer: '' }
            ]
        });
    };
    const handleRemovePopularQuestion = (index) => {
        const newQuestions = [...editForm.popularQuestions];
        newQuestions.splice(index, 1);
        setEditForm({
            ...editForm,
            popularQuestions: newQuestions
        });
    };
    const handlePopularQuestionChange = (index, field, value) => {
        const newQuestions = [...editForm.popularQuestions];
        newQuestions[index] = {
            ...newQuestions[index],
            [field]: value
        };
        setEditForm({
            ...editForm,
            popularQuestions: newQuestions
        });
    };

    // 4. Sửa handleUpdateCity để gửi FormData nếu có ảnh mới, hoặc object thường nếu không
    const handleUpdateCity = async () => {
        try {
            if (!editForm.name.trim() || !editForm.description.trim() || !editForm.bestTimeToVisit.trim()) {
                toast.error('Vui lòng điền đầy đủ thông tin cơ bản');
                return;
            }
            // Kiểm tra thông tin của popular places
            const invalidPlaces = editForm.popularPlaces.filter(
                place => !place.name.trim() || !place.description.trim()
            );
            if (invalidPlaces.length > 0) {
                toast.error('Vui lòng điền đầy đủ thông tin cho tất cả địa điểm nổi bật');
                return;
            }
            // Kiểm tra thông tin của popular questions
            const invalidQuestions = editForm.popularQuestions.filter(
                q => !q.Question.trim() || !q.answer.trim()
            );
            if (invalidQuestions.length > 0) {
                toast.error('Vui lòng điền đầy đủ thông tin cho tất cả câu hỏi phổ biến');
                return;
            }

            // Xử lý ảnh thành phố - gửi cả ảnh mới và ảnh cũ còn lại
            const remainingOldImages = editImages.filter(img => typeof img === 'string');
            const newImages = editImages.filter(img => img instanceof File);
            const originalImages = editingCity?.img || [];
            
            // Debug logging
            console.log('=== UPDATE CITY DEBUG ===');
            console.log('Original city images:', originalImages);
            console.log('Current editImages:', editImages);
            console.log('Remaining old images:', remainingOldImages);
            console.log('New images:', newImages);
            console.log('Images deleted?', originalImages.length !== remainingOldImages.length);
            
            // Luôn dùng FormData để đảm bảo backend xử lý đúng
            const formData = new FormData();
            formData.append('name', editForm.name.trim());
            formData.append('description', editForm.description.trim());
            formData.append('bestTimeToVisit', editForm.bestTimeToVisit.trim());
            
            // Gửi ảnh cũ còn lại (để backend biết những ảnh nào cần giữ)
            if (remainingOldImages.length > 0) {
                remainingOldImages.forEach(img => {
                    formData.append('oldImages', img);
                });
            }
            
            // Gửi ảnh mới (nếu có)
            if (newImages.length > 0) {
                newImages.forEach(img => {
                    formData.append('images', img);
                });
            }
            
            // Thêm một file dummy để đảm bảo backend nhận diện là multipart/form-data
            if (newImages.length === 0) {
                // Tạo một blob rỗng để đảm bảo req.files tồn tại
                const emptyBlob = new Blob([''], { type: 'text/plain' });
                formData.append('dummy', emptyBlob, 'dummy.txt');
            }
            
            // Địa điểm nổi bật
            editForm.popularPlaces.forEach((place, idx) => {
                formData.append(`popularPlaces[${idx}].name`, place.name.trim());
                formData.append(`popularPlaces[${idx}].description`, place.description.trim());
                // Ảnh địa điểm
                if (editPopularPlacesImages[idx]?.image instanceof File) {
                    formData.append(`popularPlaces[${idx}].img`, editPopularPlacesImages[idx].image);
                } else if (editPopularPlacesImages[idx]?.oldImg) {
                    formData.append(`popularPlaces[${idx}].oldImg`, editPopularPlacesImages[idx].oldImg);
                }
            });
            
            // Câu hỏi phổ biến
            editForm.popularQuestions.forEach((q, idx) => {
                formData.append(`popularQuestion[${idx}].Question`, q.Question.trim());
                formData.append(`popularQuestion[${idx}].answer`, q.answer.trim());
            });

            // Debug FormData
            console.log('FormData entries:');
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }
            console.log('=== END DEBUG ===');

            await updateCity({ id: editingCity._id, data: formData }).unwrap();
            toast.success('Cập nhật thành phố thành công!');
            handleCloseEditModal();
            refetch();
        } catch (error) {
            console.error('Update city error:', error);
            toast.error(error.data?.message || 'Có lỗi xảy ra khi cập nhật thành phố');
        }
    };

    // Xử lý xóa thành phố
    const handleDeleteCity = async () => {
        try {
            await deleteCity(cityToDelete._id).unwrap();
            toast.success('Xóa thành phố thành công!');
            handleCloseDeleteDialog();
            refetch();
        } catch (error) {
            console.error('Delete city error:', error);
            toast.error(error.data?.message || 'Có lỗi xảy ra khi xóa thành phố');
        }
    };

    const handleOpenDeleteDialog = (city) => {
        setCityToDelete(city);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setCityToDelete(null);
    };

    if (isLoading) {
        return (
            <div className='bg-softBlue min-h-screen p-4 md:p-8'>
                <div className='bg-white rounded-lg shadow-md mt-4 p-4 md:p-6 flex justify-center items-center'>
                    <p className='text-gray-500'>Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='bg-softBlue min-h-screen p-4 md:p-8'>
                <div className='bg-white rounded-lg shadow-md mt-4 p-4 md:p-6'>
                    <p className='text-red-500'>Có lỗi khi tải dữ liệu: {error.message}</p>
                    <button 
                        onClick={refetch}
                        className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    const cities = Array.isArray(citiesResponse?.data) ? citiesResponse.data : 
                  Array.isArray(citiesResponse) ? citiesResponse : [];
    const validCities = cities.filter(city => city && typeof city.name === 'string');

    return (
        <div className='bg-softBlue min-h-screen p-4 md:p-8'>
            <div className='mx-auto'>
                <div className='flex items-center'>
                    <p className='flex-1 font-semibold text-[20px] md:text-[24px]'>Tất cả thành phố</p>
                    <button
                        className='py-2 px-4 rounded-lg bg-blue-500 text-white font-semibold text-[14px] flex items-center'
                        onClick={() => navigate('/admin/create-city')}
                    >
                        <FaPlus className='mr-2' />
                        Thêm thành phố
                    </button>
                </div>
                <div className='bg-white rounded-lg shadow-md mt-4 p-4 md:p-6'>
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className='flex flex-col sm:flex-row sm:items-center gap-3'>
                        <span className='text-[16px] font-medium text-gray-500'>Tìm kiếm</span>
                        <div className='flex items-center border border-gray-300 rounded-lg p-2 focus-within:border-gray-600'>
                            <input
                                type='text'
                                placeholder='Tìm kiếm thành phố...'
                                className='text-[14px] outline-none flex-1'
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    if (!e.target.value.trim()) {
                                        setSearched(false);
                                        setFilteredResults([]);
                                    }
                                }}
                            />
                            <button type="submit" className='p-1 hover:bg-gray-100 rounded-full'>
                                <IoSearch className='text-gray-500 text-[20px]' />
                            </button>
                        </div>

                        <div className='ml-auto flex items-center'>
                            <button 
                                type="button"
                                className='hover:bg-gray-100 p-2 rounded-full' 
                                onClick={refetch}
                            >
                                <IoMdRefresh className='text-[28px] text-gray-400' />
                            </button>
                        </div>
                    </form>

                    {/* Results */}
                    <div className='mt-4 p-4'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                            {(searched ? filteredResults : validCities).map((city) => (
                                <CityCard
                                    key={city._id}
                                    city={city}
                                    onEdit={() => handleOpenEditModal(city)}
                                    onDelete={() => handleOpenDeleteDialog(city)}
                                    isDeleting={isDeleting && cityToDelete?._id === city._id}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialog xác nhận xóa */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Xác nhận xóa thành phố
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa thành phố "{cityToDelete?.name}"? 
                        Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={handleCloseDeleteDialog}
                        color="primary"
                    >
                        Hủy
                    </Button>
                                <Button
                        onClick={handleDeleteCity} 
                        color="error" 
                        variant="contained"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Đang xóa...' : 'Xóa'}
                                </Button>
                </DialogActions>
            </Dialog>

            {/* Modal chỉnh sửa */}
            <Dialog
                open={editModalOpen}
                onClose={handleCloseEditModal}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    style: {
                        borderRadius: '16px',
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <MdEdit className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Chỉnh sửa thành phố</h2>
                            <p className="text-blue-100 text-sm">Cập nhật thông tin và hình ảnh thành phố</p>
                        </div>
                    </div>
                </DialogTitle>
                <DialogContent className="p-0">
                    <div className="p-8 space-y-8">
                        {/* Basic Information Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <MdEdit className="text-blue-600" />
                                </div>
                                Thông tin cơ bản
                            </h3>
                            
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Tên thành phố <span className="text-red-500">*</span>
                                    </label>
                                    <TextField
                                        fullWidth
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        variant="outlined"
                                        size="medium"
                                        placeholder="Nhập tên thành phố"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                '&:hover fieldset': {
                                                    borderColor: '#3B82F6',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#3B82F6',
                                                    borderWidth: '2px',
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Mô tả <span className="text-red-500">*</span>
                                    </label>
                                    <TextField
                                        fullWidth
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        variant="outlined"
                                        multiline
                                        rows={4}
                                        placeholder="Nhập mô tả chi tiết về thành phố"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                '&:hover fieldset': {
                                                    borderColor: '#3B82F6',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#3B82F6',
                                                    borderWidth: '2px',
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Thời điểm tốt nhất để ghé thăm <span className="text-red-500">*</span>
                                    </label>
                                    <TextField
                                        fullWidth
                                        value={editForm.bestTimeToVisit}
                                        onChange={(e) => setEditForm({ ...editForm, bestTimeToVisit: e.target.value })}
                                        variant="outlined"
                                        multiline
                                        rows={3}
                                        placeholder="Nhập thông tin về thời điểm tốt nhất để tham quan"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                '&:hover fieldset': {
                                                    borderColor: '#3B82F6',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#3B82F6',
                                                    borderWidth: '2px',
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* City Images Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-2">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <AddIcon className="text-green-600" />
                                </div>
                                Hình ảnh thành phố
                            </h3>
                            
                            <div className="bg-gray-50 rounded-xl p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {editImages.map((img, idx) => (
                                        <div key={idx} className="relative group">
                                            <img 
                                                src={img instanceof File ? URL.createObjectURL(img) : img} 
                                                alt={`city-edit-${idx}`} 
                                                className="w-full h-32 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
                                            />
                                            <IconButton 
                                                size="small" 
                                                className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600 shadow-md"
                                                onClick={() => handleRemoveEditImage(idx)}
                                                sx={{
                                                    backgroundColor: '#EF4444',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: '#DC2626'
                                                    }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </div>
                                    ))}
                                    <Button 
                                        variant="outlined" 
                                        component="label" 
                                        className="h-32 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors"
                                        sx={{
                                            borderStyle: 'dashed',
                                            borderWidth: '2px',
                                            borderColor: '#93C5FD',
                                            '&:hover': {
                                                borderColor: '#3B82F6',
                                                backgroundColor: '#EFF6FF'
                                            }
                                        }}
                                    >
                                        <AddIcon className="text-blue-500" />
                                        <span className="text-sm font-medium text-blue-600">Thêm ảnh</span>
                                        <input type="file" hidden multiple accept="image/*" onChange={handleEditImageUpload} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Popular Places Section */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                        <MdAdd className="text-purple-600" />
                                    </div>
                                    Địa điểm nổi bật
                                </h3>
                                <Button
                                    startIcon={<MdAdd />}
                                    onClick={handleAddPopularPlace}
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        backgroundColor: '#8B5CF6',
                                        borderRadius: '8px',
                                        '&:hover': {
                                            backgroundColor: '#7C3AED'
                                        }
                                    }}
                                >
                                    Thêm địa điểm
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {editForm.popularPlaces.map((place, index) => (
                                    <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 relative">
                                        <IconButton
                                            size="small"
                                            className="absolute top-3 right-3 bg-red-500 text-white hover:bg-red-600"
                                            onClick={() => handleRemovePopularPlace(index)}
                                            sx={{
                                                backgroundColor: '#EF4444',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: '#DC2626'
                                                }
                                            }}
                                        >
                                            <MdDelete />
                                        </IconButton>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Tên địa điểm <span className="text-red-500">*</span>
                                                    </label>
                                                    <TextField
                                                        fullWidth
                                                        value={place.name}
                                                        onChange={(e) => handlePopularPlaceChange(index, 'name', e.target.value)}
                                                        variant="outlined"
                                                        size="small"
                                                        placeholder="Nhập tên địa điểm"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                backgroundColor: 'white',
                                                                borderRadius: '8px'
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">
                                                        Mô tả địa điểm <span className="text-red-500">*</span>
                                                    </label>
                                                    <TextField
                                                        fullWidth
                                                        value={place.description}
                                                        onChange={(e) => handlePopularPlaceChange(index, 'description', e.target.value)}
                                                        variant="outlined"
                                                        multiline
                                                        rows={2}
                                                        size="small"
                                                        placeholder="Nhập mô tả địa điểm"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                backgroundColor: 'white',
                                                                borderRadius: '8px'
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Hình ảnh</label>
                                                <div className="flex items-center gap-4">
                                                    {(editPopularPlacesImages[index]?.image || editPopularPlacesImages[index]?.oldImg) && (
                                                        <div className="relative">
                                                            <img
                                                                src={editPopularPlacesImages[index]?.image ? URL.createObjectURL(editPopularPlacesImages[index].image) : editPopularPlacesImages[index]?.oldImg}
                                                                alt={place.name}
                                                                className="w-24 h-24 object-cover rounded-lg shadow-sm"
                                                            />
                                                            <IconButton
                                                                size="small"
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600"
                                                                onClick={() => handleRemoveEditPopularPlaceImage(index)}
                                                                sx={{
                                                                    backgroundColor: '#EF4444',
                                                                    color: 'white',
                                                                    '&:hover': {
                                                                        backgroundColor: '#DC2626'
                                                                    }
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </div>
                                                    )}
                                                    <Button
                                                        variant="outlined"
                                                        component="label"
                                                        startIcon={<AddIcon />}
                                                        className={editPopularPlacesImages[index]?.image || editPopularPlacesImages[index]?.oldImg ? "h-12" : "h-24 w-24"}
                                                        sx={{
                                                            borderStyle: 'dashed',
                                                            borderRadius: '8px',
                                                            backgroundColor: 'white'
                                                        }}
                                                    >
                                                        {editPopularPlacesImages[index]?.image || editPopularPlacesImages[index]?.oldImg ? 'Thay đổi ảnh' : 'Thêm ảnh'}
                                                        <input
                                                            type="file"
                                                            hidden
                                                            accept="image/*"
                                                            onChange={(e) => handleEditPopularPlaceImageChange(index, e.target.files[0])}
                                                        />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Divider />

                        {/* Popular Questions Section */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                        <MdAdd className="text-orange-600" />
                                    </div>
                                    Câu hỏi phổ biến
                                </h3>
                                <Button
                                    startIcon={<MdAdd />}
                                    onClick={handleAddPopularQuestion}
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        backgroundColor: '#F97316',
                                        borderRadius: '8px',
                                        '&:hover': {
                                            backgroundColor: '#EA580C'
                                        }
                                    }}
                                >
                                    Thêm câu hỏi
                                </Button>
                            </div>
                            
                            <div className="space-y-4">
                                {editForm.popularQuestions.map((q, idx) => (
                                    <div key={idx} className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6 relative">
                                        <IconButton
                                            size="small"
                                            className="absolute top-3 right-3 bg-red-500 text-white hover:bg-red-600"
                                            onClick={() => handleRemovePopularQuestion(idx)}
                                            sx={{
                                                backgroundColor: '#EF4444',
                                                color: 'white',
                                                '&:hover': {
                                                    backgroundColor: '#DC2626'
                                                }
                                            }}
                                        >
                                            <MdDelete />
                                        </IconButton>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Câu hỏi <span className="text-red-500">*</span>
                                                </label>
                                                <TextField
                                                    fullWidth
                                                    value={q.Question}
                                                    onChange={e => handlePopularQuestionChange(idx, 'Question', e.target.value)}
                                                    variant="outlined"
                                                    size="small"
                                                    placeholder="Nhập câu hỏi"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            backgroundColor: 'white',
                                                            borderRadius: '8px'
                                                        }
                                                    }}
                                                />
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Câu trả lời <span className="text-red-500">*</span>
                                                </label>
                                                <TextField
                                                    fullWidth
                                                    value={q.answer}
                                                    onChange={e => handlePopularQuestionChange(idx, 'answer', e.target.value)}
                                                    variant="outlined"
                                                    multiline
                                                    rows={2}
                                                    size="small"
                                                    placeholder="Nhập câu trả lời"
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            backgroundColor: 'white',
                                                            borderRadius: '8px'
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions className="p-6 bg-gray-50 border-t">
                    <Button 
                        onClick={handleCloseEditModal} 
                        variant="outlined"
                        size="large"
                        sx={{
                            borderRadius: '8px',
                            minWidth: '120px'
                        }}
                    >
                        Hủy bỏ
                    </Button>
                    <Button
                        onClick={handleUpdateCity}
                        variant="contained"
                        size="large"
                        disabled={isUpdating}
                        sx={{
                            backgroundColor: '#3B82F6',
                            borderRadius: '8px',
                            minWidth: '120px',
                            '&:hover': {
                                backgroundColor: '#2563EB'
                            }
                        }}
                    >
                        {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ManageCity; 