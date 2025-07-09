import React, { useState, useEffect, useRef } from "react";
import { TiCloudStorage } from "react-icons/ti";
import { CLOUDINARY_BASE_URL } from "../constants/hotel";

const UploadImg = ({
  label,
  existingImages = [],
  newImages = [],
  onImagesChange,
}) => {
  const [Images, setImages] = useState(newImages);
  const [isDragOver, setIsDragOver] = useState(false); // thêm state
  const fileInputRef = useRef(null);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve({
        base64: reader.result,
        preview: URL.createObjectURL(file)
      });
      reader.onerror = error => reject(error);
    });
  };

  const handleFileInputChange = async (e) => {
    const files = Array.from(e.target.files || e.dataTransfer.files);
    if (files.length === 0) return;

    try {
      const newImagePromises = files.map(async (file) => {
        const { base64, preview } = await fileToBase64(file);
        return {
          id: Date.now() + Math.random(),
          file,
          preview,
          base64
        };
      });
      const addedImages = await Promise.all(newImagePromises);
      setImages(prev => [...prev, ...addedImages]);
    } catch (error) {
      console.error("Error reading files:", error);
    }
    if (e.target.value) e.target.value = "";
  };

  const handleDeleteNewImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDeleteExistingImage = (publicId) => {
    onImagesChange({
      deletedExisting: publicId,
      newImages: Images.map(({ id, preview, base64, file }) => ({ id, preview, base64, file }))
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileInputChange(e);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  useEffect(() => {
    onImagesChange({
      newImages: Images.map(({ id, preview, base64, file }) => ({ id, preview, base64, file })),
      existingImages
    });
  }, [Images, existingImages]);

  return (
    <div className="my-4">
      <label className="block font-medium mb-2 text-[18px]">{label}</label>

      {/* Vùng kéo thả ảnh */}
      <div
        className={`border-2 ${isDragOver ? 'border-blue-400' : 'border-gray-400'} border-dashed rounded-md p-8 text-center cursor-pointer transition`}
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-gray-600">

          {isDragOver ? (
            <div className="">
              <div className="flex justify-center items-center"><TiCloudStorage className="text-[50px] text-blue-400" /></div>
              <p className="text-blue-400">Thả ảnh vào đây</p>
            </div>
          ) : (
            <div className="">
              <div className="flex justify-center items-center"><TiCloudStorage className="text-[50px]" /></div>
              <p className="">Click để chọn ảnh hoặc kéo-thả ảnh vào đây</p>
            </div>
          )}
        </div>
        <input
          id="fileInput"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          ref={fileInputRef}
        />
      </div>

      {/* Hiển thị ảnh */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-4">
        {/* Ảnh hiện có */}
        {existingImages.map((publicId, index) => (
          <div key={index} className="relative group">
            <img
              src={`${CLOUDINARY_BASE_URL}/${publicId}`}
              alt={`hotel-${publicId}`}
              className="w-full h-32 object-cover rounded shadow"
            />
            <button
              type="button"
              onClick={() => handleDeleteExistingImage(publicId)}
              className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              ✕x
            </button>
          </div>
        ))}

        {/* Ảnh mới thêm */}
        {Images.map((img) => (
          <div key={img.id} className="relative group">
            <img
              src={img.preview}
              alt={`preview-${img.id}`}
              className="w-full h-32 object-cover rounded shadow"
            />
            <button
              type="button"
              onClick={() => handleDeleteNewImage(img.id)}
              className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadImg;