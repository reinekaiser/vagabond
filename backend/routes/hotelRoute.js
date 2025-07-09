import express from "express";
import {
    getHotelById,
    listRoomTypeByHotel,
    listRoomByRoomType,
    addHotel,
    addRoomType,
    addRoom,
    updateHotel,
    updateRoomType,
    updateRoom,
    deleteRoom,
    deleteRoomType,
    deleteHotel,
    getSearchHotelSuggestions,
    getSearchHotelResults,
    filterHotels,
    getHotels,
    getAvailableRooms,
} from "../controllers/hotelController.js";
const router = express.Router();


//Lấy danh sách gợi ý khách sạn
router.get("/search", getSearchHotelSuggestions);

router.get("/:id/available-rooms", getAvailableRooms);
//Lấy danh sách khách sạn
router.get("/", getHotels);

router.get("/:hotelId", getHotelById);

//Thêm khách sạn
router.post("/", addHotel);

//Cập nhật thông tin khách sạn
router.put("/update/:hotelId", updateHotel);

//Xóa khách sạn
router.delete("/delete/:hotelId", deleteHotel);

//Lấy danh sách loại phòng theo khách sạn
router.get("/:hotelId/room-types", listRoomTypeByHotel);

//Thêm loại phòng cho khách sạn
router.post("/:hotelId/room-types", addRoomType);

//Cập nhật thông tin loại phòng
router.put("/:hotelId/room-types/update/:roomTypeId", updateRoomType);

//Xóa loại phòng
router.delete("/:hotelId/room-types/delete/:roomTypeId", deleteRoomType);

//Lấy danh sách phòng theo loại phòng
router.get("/:hotelId/room-types/:roomTypeId/rooms", listRoomByRoomType);

//Thêm phòng vào loại phòng
router.post("/:hotelId/room-types/:roomTypeId/rooms", addRoom);

//Cập nhật thông tin phòng
router.put("/:hotelId/room-types/:roomTypeId/rooms/update/:roomId", updateRoom);

//Xóa phòng
router.delete("/:hotelId/room-types/:roomTypeId/rooms/delete/:roomId", deleteRoom);

//Lấy danh sách khách sạn theo từ khóa
router.get("/search-results", getSearchHotelResults);

//Lọc danh sách khách sạn
router.get("/search-results/filter", filterHotels);

export default router;