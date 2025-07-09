import React from 'react';
import { MdEdit, MdDelete, MdMoreVert, MdVisibility } from "react-icons/md";
import { LuMapPin } from "react-icons/lu";
import { FaRegCalendarAlt } from "react-icons/fa";

const CityCard = ({ city, onEdit, onDelete, isDeleting }) => {
  const images = Array.isArray(city.img) ? city.img : [];
  const mainImg = images[0] || null;
  const subImgs = images.slice(1, 3);
  const remainCount = images.length - 3;
  const address = city.address || city.location || '';
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef();

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Handle click on card to open edit modal
  const handleCardClick = (e) => {
    // Prevent opening modal when clicking on menu button or menu items
    if (e.target.closest('.menu-trigger') || e.target.closest('.menu-dropdown')) {
      return;
    }
    onEdit();
  };

  return (
    <div 
      className='p-3 rounded-xl shadow-md border border-gray-100 h-[360px] relative hover:shadow-xl duration-300 bg-white flex flex-col cursor-pointer' 
      onClick={handleCardClick}
    >
      <div className="w-full h-[160px] grid grid-cols-3 gap-1 rounded-xl overflow-hidden mb-2">
        <div className="col-span-2 h-full">
          {mainImg ? (
            <img src={mainImg} alt={city.name} className="w-full h-full object-cover rounded-tl-xl rounded-bl-xl" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">Không có hình ảnh</div>
          )}
        </div>
        <div className="flex flex-col h-full gap-1">
          {subImgs.map((img, idx) => (
            <img key={idx} src={img} alt={city.name + idx} className={`w-full h-1/2 object-cover ${idx === 0 ? 'rounded-tr-xl' : ''}`} />
          ))}
          {remainCount > 0 && (
            <div className="w-full h-1/2 bg-black bg-opacity-60 text-white flex items-center justify-center rounded-br-xl text-[16px] font-semibold">
              +{remainCount}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between px-1 pt-1 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1 text-gray-400 text-[13px]">
            <FaRegCalendarAlt className="text-[15px]" />
            Ngày thêm: {city.createdAt ? new Date(city.createdAt).toLocaleDateString('vi-VN') : '---'}
          </div>
          <h3 className='text-[18px] font-bold hover:underline duration-300 pb-1 w-fit text-black mb-1'>
            {city.name}
          </h3>
          {address && (
            <div className='flex items-center text-[14px] text-gray-600 mb-1'>
              <LuMapPin className='text-red-500 text-[18px] mr-1' />
              {address}
            </div>
          )}
          <p className='text-[14px] text-gray-600 line-clamp-2'>{city.description}</p>
        </div>
        {city.popularPlace && city.popularPlace.length > 0 && (
          <div className="mt-1">
            <span className="font-medium text-[13px]">Địa điểm nổi bật:</span>
            <ul className="pl-4 text-[13px] text-gray-500 flex gap-2">
              {city.popularPlace.slice(0, 2).map((place, idx) => (
                <li key={idx}>{place.name}</li>
              ))}
              {city.popularPlace.length > 2 && (
                <li>+{city.popularPlace.length - 2} địa điểm khác</li>
              )}
            </ul>
          </div>
        )}
      </div>
      <div className="absolute bottom-3 right-3 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event
            setShowMenu((v) => !v);
          }}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full menu-trigger"
          title="Menu"
        >
          <MdMoreVert size={22} />
        </button>
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute z-50 top-full right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-48 flex flex-col animate-fadeIn menu-dropdown"
          >
            <button
              onClick={(e) => { 
                e.stopPropagation(); // Prevent card click event
                setShowMenu(false); 
                onEdit(); 
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700 text-[16px] font-medium border-b border-gray-100"
            >
              <MdVisibility className="text-[20px]" />
              <span className="leading-tight text-[15px] whitespace-nowrap">
                Xem và sửa
              </span>
            </button>
            <button
              onClick={(e) => { 
                e.stopPropagation(); // Prevent card click event
                setShowMenu(false); 
                onDelete(); 
              }}
              className="flex items-center  gap-2 px-4 py-2 hover:bg-red-50 text-red-500 text-[16px] font-semibold"
              disabled={isDeleting}
            >
              <MdDelete className="text-[20px]" />
              Xoá
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityCard; 