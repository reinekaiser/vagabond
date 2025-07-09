import Hotel from "../models/hotel.js";
import HotelRoomType from "../models/hotelRoomType.js";
import HotelBooking from "../models/hotelBooking.js";
import City from "../models/city.js"
import mongoose from "mongoose";
import cloudinary from "../utils/cloudinary.js";

const getHotelById = async (req, res) => {
    try {
        const { hotelId } = req.params;
        if (!hotelId)
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
        const hotel = await Hotel.findById(hotelId).populate({
            path: "city",
            select: "name",
        }).populate({
            path: "roomTypes",
        })
        // .populate({
        //     path: "serviceFacilities",
        //     populate: {
        //         path: "category",
        //     }
        // });
        if (!hotel)
            return res.status(404).json({ error: "Khách sạn không tồn tại" });

        res.status(200).json(hotel);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
}

const listHotel = async (req, res) => {
    try {
        const hotels = await Hotel.find({}).populate({
            path: "city",
            select: "name",
        }).populate({
            path: "roomTypes",
        }).populate({
            path: "serviceFacilities",
            populate: {
                path: "category",
            }
        });
        res.status(200).json(hotels);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
}

const listRoomTypeByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        if (!hotelId)
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
        const hotel = await Hotel.findById(hotelId);
        if (!hotel)
            return res.status(404).json({ error: "Khách sạn không tồn tại" });

        const roomTypes = await HotelRoomType.find({ _id: { $in: hotel.roomTypes } });
        res.status(200).json(roomTypes);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
}

const listRoomByRoomType = async (req, res) => {
    try {
        const { roomTypeId } = req.params;
        if (!roomTypeId)
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
        const roomType = await HotelRoomType.findById(roomTypeId);
        if (!roomType)
            return res.status(404).json({ error: "Loại phòng không tồn tại" });

        res.status(200).json(roomType.rooms);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
}

const addHotel = async (req, res) => {
    try {
        const {
            name, lat, lng, address, cityName, rooms, description, img,
            serviceFacilities, policies, roomTypes
        } = req.body;

        if (
            !name || !address || !cityName || !rooms || !description ||
            !serviceFacilities || !policies || !roomTypes || roomTypes.length === 0
        ) {
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc hoặc chưa có loại phòng" });
        }

        // Tìm thành phố
        // const city = await City.findOne({ name: cityName });
        const city = await City.findById(cityName);
        if (!city) {
            return res.status(400).json({ error: "Thành phố chưa tồn tại" });
        }

        // Tạo room types
        const roomTypeIds = [];
        for (const roomTypeData of roomTypes) {
            const roomType = new HotelRoomType(roomTypeData);
            await roomType.save();
            roomTypeIds.push(roomType._id);
        }

        const newHotel = new Hotel({
            name, img: img, lat, lng, address, city: city._id, rooms, description,
            serviceFacilities, policies, roomTypes: roomTypeIds
        });

        await newHotel.save();
        res.status(201).json({ message: "Thêm khách sạn thành công", hotel: newHotel });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const updateHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const {
            name, img, lat, lng, address, cityName, rooms, description,
            serviceFacilities, policies
        } = req.body;

        let hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.status(404).json({ error: "Khách sạn không tồn tại" });

        if (cityName) {
            // const city = await City.findOne({ name: cityName });
            const city = await City.findById(cityName);
            if (!city) return res.status(400).json({ error: "Thành phố chưa tồn tại" });
            hotel.city = city._id;
        }
        hotel.name = name || hotel.name;
        hotel.img = img || hotel.img;
        hotel.lat = lat || hotel.lat;
        hotel.lng = lng || hotel.lng;
        hotel.address = address || hotel.address;
        hotel.rooms = rooms || hotel.rooms;
        hotel.description = description || hotel.description;
        hotel.policies = policies || hotel.policies;
        hotel.serviceFacilities = serviceFacilities || hotel.serviceFacilities;

        await hotel.save();
        res.status(200).json({ message: "Cập nhật khách sạn thành công", hotel });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const addRoomType = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const { name, img, area, view, roomFacilities, rooms } = req.body;
        if (!name || !rooms || rooms.length === 0) {
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc hoặc chưa có phòng nào" });
        }

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ error: "Khách sạn không tồn tại" });
        }

        const newRoomType = new HotelRoomType({
            name, img, area, view,
            roomFacilities: roomFacilities || [],
            rooms,
        });

        await newRoomType.save();
        hotel.roomTypes.push(newRoomType._id);
        await hotel.save();

        res.status(201).json({ message: "Thêm loại phòng thành công", newRoomType });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
}

const updateRoomType = async (req, res) => {
    try {
        const { hotelId, roomTypeId } = req.params;
        const { name, img, area, view, roomFacilities } = req.body;

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.status(404).json({ error: "Khách sạn không tồn tại" });
        let roomType = await HotelRoomType.findById(roomTypeId);
        if (!roomType) return res.status(404).json({ error: "Loại phòng không tồn tại" });

        roomType.name = name || roomType.name;
        roomType.img = img || roomType.img;
        roomType.area = area || roomType.area;
        roomType.view = view || roomType.view;
        roomType.roomFacilities = roomFacilities || roomType.roomFacilities;

        await roomType.save();
        res.status(200).json({ message: "Cập nhật loại phòng thành công", roomType });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const addRoom = async (req, res) => {
    try {
        const { roomTypeId } = req.params;
        const { bedType, serveBreakfast, maxOfGuest, numberOfRoom, cancellationPolicy, price } = req.body;

        if (!bedType || !maxOfGuest || !numberOfRoom || !cancellationPolicy || !price)
            return res.status(400).json("Thiếu thông tin bắt buộc");

        const roomType = await HotelRoomType.findById(roomTypeId);
        if (!roomType)
            return res.status(400).json({ error: "Loại phòng không tồn tại" });

        const newRoom = {
            bedType, serveBreakfast: serveBreakfast,
            maxOfGuest: Number(maxOfGuest),
            numberOfRoom: Number(numberOfRoom),
            cancellationPolicy, price: Number(price),
        };

        roomType.rooms.push(newRoom);
        await roomType.save();
        res.status(201).json({ message: "Thêm phòng thành công", roomType });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
}

const updateRoom = async (req, res) => {
    try {
        const { hotelId, roomTypeId, roomId } = req.params;
        const { bedType, serveBreakfast, maxOfGuest, numberOfRoom, cancellationPolicy, price } = req.body;

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.status(404).json({ error: "Khách sạn không tồn tại" });

        const roomType = await HotelRoomType.findById(roomTypeId);
        if (!roomType) return res.status(404).json({ error: "Loại phòng không tồn tại" });

        const roomIndex = roomType.rooms.findIndex(room => room._id.equals(roomId));
        if (roomIndex === -1) return res.status(404).json({ error: "Phòng không tồn tại" });

        let room = roomType.rooms[roomIndex];
        room.bedType = bedType || room.bedType;
        room.serveBreakfast = serveBreakfast !== undefined ? serveBreakfast : room.serveBreakfast;
        room.maxOfGuest = maxOfGuest !== undefined ? Number(maxOfGuest) : room.maxOfGuest;
        room.numberOfRoom = numberOfRoom !== undefined ? Number(numberOfRoom) : room.numberOfRoom;
        room.cancellationPolicy = cancellationPolicy || room.cancellationPolicy;
        room.price = price !== undefined ? Number(price) : room.price;

        roomType.rooms[roomIndex] = room;
        await roomType.save();
        res.status(200).json({ message: "Cập nhật phòng thành công", roomType });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const checkAndDeleteHotel = async (hotelId) => {
    const hotel = await Hotel.findById(hotelId);
    if (hotel && hotel.roomTypes.length === 0) {
        //Xoá ảnh của khách sạn trên cloudinary
        if (Array.isArray(hotel.img)) {
            for (const publicId of hotel.img) {
                await cloudinary.uploader.destroy(publicId);
            }
        }
        await Hotel.findByIdAndDelete(hotelId);
        return true; // Khách sạn đã được xóa
    }
    return false; // Khách sạn vẫn còn loại phòng
};

const deleteRoom = async (req, res) => {
    try {
        const { hotelId, roomTypeId, roomId } = req.params;
        if (!hotelId || !roomTypeId || !roomId)
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

        const hotel = await Hotel.findById(hotelId);
        if (!hotel)
            return res.status(404).json({ error: "Khách sạn không tồn tại" });

        const roomType = await HotelRoomType.findById(roomTypeId);
        if (!roomType)
            return res.status(400).json({ error: "Loại phòng không tồn tại" });

        const roomIndex = roomType.rooms.findIndex(room => room._id.equals(roomId));
        if (roomIndex === -1)
            return res.status(404).json({ error: "Phòng không tồn tại" });

        roomType.rooms = roomType.rooms.filter(room => !room._id.equals(roomId));
        await roomType.save();

        if (roomType.rooms.length == 0) {
            //Xoá ảnh trong roomType trên cloudinary
            if (Array.isArray(roomType.img)) {
                for (const publicId of roomType.img) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }
            // Xóa roomType khỏi danh sách roomTypes của hotel
            const roomTypeIndex = hotel.roomTypes.findIndex(id => id.equals(roomTypeId));
            if (roomTypeIndex !== -1) {
                hotel.roomTypes.splice(roomTypeIndex, 1);
                await hotel.save();
            }
            await HotelRoomType.findByIdAndDelete(roomTypeId);
        }

        // Kiểm tra và xóa khách sạn nếu không còn loại phòng nào
        const isHotelDeleted = await checkAndDeleteHotel(hotelId);
        if (isHotelDeleted) {
            return res.status(200).json({ message: "Xóa phòng, loại phòng và khách sạn vì khách sạn không còn phòng" });
        }
        res.status(200).json({ message: "Xóa phòng thành công", hotel });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
}

const deleteRoomType = async (req, res) => {
    try {
        const { hotelId, roomTypeId } = req.params;
        if (!hotelId || !roomTypeId) {
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
        }
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ error: "Khách sạn không tồn tại" });
        }
        const roomType = await HotelRoomType.findById(roomTypeId);
        if (!roomType) {
            return res.status(404).json({ error: "Loại phòng không tồn tại" });
        }

        //Xoá ảnh trong roomType trên cloudinary
        if (Array.isArray(roomType.img)) {
            for (const publicId of roomType.img) {
                await cloudinary.uploader.destroy(publicId);
            }
        }
        // Xóa roomType khỏi danh sách roomTypes của hotel
        let roomTypeIndex = hotel.roomTypes.findIndex(id => id.equals(roomTypeId));
        hotel.roomTypes.splice(roomTypeIndex, 1);
        await hotel.save();
        await HotelRoomType.findByIdAndDelete(roomTypeId);

        const isHotelDeleted = await checkAndDeleteHotel(hotelId);
        if (isHotelDeleted) {
            return res.status(200).json({ message: "Xóa loại phòng và khách sạn vì khách sạn không còn phòng" });
        }

        res.status(200).json({ message: "Xóa loại phòng thành công", hotel });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};
const deleteHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        if (!hotelId)
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });

        const hotel = await Hotel.findById(hotelId);
        if (!hotel)
            return res.status(404).json({ error: "Khách sạn không tồn tại" });

        // Xoá ảnh của khách sạn trên Cloudinary
        if (Array.isArray(hotel.img)) {
            for (const publicId of hotel.img) {
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error(`Không xoá được ảnh khách sạn: ${publicId}`, err);
                }
            }
        }

        // Xoá ảnh của từng loại phòng
        for (const roomTypeId of hotel.roomTypes) {
            try {
                const roomType = await HotelRoomType.findById(roomTypeId);
                if (roomType && Array.isArray(roomType.img)) {
                    for (const publicId of roomType.img) {
                        try {
                            await cloudinary.uploader.destroy(publicId);
                        } catch (err) {
                            console.error(`Không xoá được ảnh roomType: ${publicId}`, err);
                        }
                    }
                }
            } catch (err) {
                console.error(`Không tìm được roomType: ${roomTypeId}`, err);
            }
        }

        await HotelRoomType.deleteMany({ _id: { $in: hotel.roomTypes } });

        await Hotel.findByIdAndDelete(hotelId);

        res.status(200).json({ message: "Xóa khách sạn thành công" });
    } catch (error) {
        console.error("Error delete hotel:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

// const getSearchHotelSuggestions = async (req, res) => {
//     try {
//         const { key } = req.query;
//         // const searchKey = key.trim();
//         const cities = await City.aggregate([
//             {
//                 $search: {
//                     index: "search_city",
//                     text: {
//                         query: key,
//                         path: ["name"],
//                         fuzzy: {},
//                     },
//                 },
//             },
//             {
//                 $limit: 3,
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     name: 1,
//                     stype: { $literal: "city" },
//                 },
//             },
//         ]);

//         res.status(200).json({ results: cities })
//     }
//     catch (error) {
//         console.log(error);
//         res.status(500).json({ error: "Lỗi server" });
//     }
// }
const getSearchHotelSuggestions = async (req, res) => {
    try {
        const { key } = req.query;
        if (!key) {
            return res.status(400).json({ error: "Missing search key" });
        }

        const regex = new RegExp(key.trim(), "i");

        const cities = await City.find({ name: { $regex: regex } })
            .limit(3)
            .select({ _id: 1, name: 1 })
            .lean();

        const results = cities.map(city => ({
            ...city,
            stype: "city",
        }));

        res.status(200).json({ results });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const getSearchHotelResults = async (req, res) => {
    try {
        const {
            type,
            value,
            check_in,
            check_out,
            minPrice,
            maxPrice,
            hotelFacilities,
            roomFacilities,
            sort
        } = req.query;

        let filterStage = { $match: {} };
        if (type && value) {
            if (type == 'city') {
                const cityId = new mongoose.Types.ObjectId(String(value));
                filterStage.$match.city = cityId;
            } else if (type == 'hotel') {
                const hotelId = new mongoose.Types.ObjectId(String(value));
                filterStage.$match._id = hotelId;
            }
        }
        if (minPrice) filterStage.$match.price = { $gte: Number(minPrice) };
        if (maxPrice) {
            filterStage.$match.price = {
                ...(filterStage.$match.price || {}),
                $lte: Number(maxPrice),
            };
        }
        if (hotelFacilities && hotelFacilities.length > 0) {
            const facilityIds = hotelFacilities.split(',').map(id => new mongoose.Types.ObjectId(String(id)));
            filterStage.$match["serviceFacilities.items"] = { $in: facilityIds };
        }

        if (roomFacilities && roomFacilities.length > 0) {
            filterStage.$lookup = {
                from: "hotelroomtypes",
                localField: "roomTypes",
                foreignField: "_id",
                as: "roomTypeDetails"
            };

            filterStage.$match["roomTypeDetails.roomFacilities"] = { $in: roomFacilities.split(',') };
        }

        let sortStage = {};
        if (sort === "new") {
            sortStage = { createdAt: -1 };
        } else if (sort === "rating") {
            sortStage = { averageRating: -1 };
        } else if (sort === "price") {
            sortStage = { price: -1 };
        } else {
            sortStage = { name: 1 };
        }

        const pageNumber = Number(req.query.page) || 1;
        const limit = 15;
        const skip = (pageNumber - 1) * limit;

        const results = await Hotel.aggregate([
            filterStage,
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    img: 1,
                    address: 1,
                    city: 1,
                    price: 1,
                    avgRating: 1,
                }
            }
        ]);

        res.json({
            hotels: results,
            totalPages: Math.ceil(results.length / limit),
            page: pageNumber,
            total: results.length,
        });

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
}

const filterHotels = async (req, res) => {
    try {
        const {
            minPrice,
            maxPrice,
            hotelFacilities,
            roomFacilities,
            sort
        } = req.query;

        let filterStage = { $match: {} };
        if (minPrice) filterStage.$match.price = { $gte: Number(minPrice) };
        if (maxPrice) {
            filterStage.$match.price = {
                ...(filterStage.$match.price || {}),
                $lte: Number(maxPrice),
            };
        }

        if (hotelFacilities && hotelFacilities.length > 0) {
            const facilityIds = hotelFacilities.split(',').map(id => new mongoose.Types.ObjectId(String(id)));
            filterStage.$match["serviceFacilities.items"] = { $in: facilityIds };
        }

        if (roomFacilities && roomFacilities.length > 0) {
            filterStage.$lookup = {
                from: "hotelroomtypes",
                localField: "roomTypes",
                foreignField: "_id",
                as: "roomTypeDetails"
            };

            filterStage.$match["roomTypeDetails.roomFacilities"] = { $in: roomFacilities.split(',') };
        }

        let sortStage = {};
        if (sort === "new") {
            sortStage = { createdAt: -1 };
        } else if (sort === "rating") {
            sortStage = { averageRating: -1 };
        } else if (sort === "price") {
            sortStage = { price: -1 };
        } else {
            sortStage = { name: 1 };
        }

        const pageNumber = Number(req.query.page) || 1;
        const limit = 15;
        const skip = (pageNumber - 1) * limit;

        const results = await Hotel.aggregate([
            filterStage,
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    img: 1,
                    address: 1,
                    city: 1,
                    price: 1,
                    avgRating: 1,
                }
            }
        ]);

        res.json({
            hotels: results,
            totalPages: Math.ceil(results.length / limit),
            page: pageNumber,
            total: results.length,
        });

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
}

const getHotels = async (req, res) => {
    try {
        const {
            minPrice,
            maxPrice,
            hotelFacilities,
            roomFacilities,
            city,
            sort,
            page,
            limit,
        } = req.query;

        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 6;
        const skip = (pageNumber - 1) * pageSize;

        let hotels = await Hotel.find()
            .populate("city")
            .populate("serviceFacilities")
            .populate({
                path: "roomTypes",
                model: "HotelRoomType",
            });

        if (city) {
            hotels = hotels.filter(hotel => hotel.city.name.toLowerCase() === city.toLowerCase());
        }
        if (hotelFacilities) {
            const selectedFacilities = hotelFacilities.split(",");
            hotels = hotels.filter(hotel =>
                selectedFacilities.every(facilityId =>
                    hotel.serviceFacilities.some(f => f._id.toString() === facilityId)
                )
            );
        }
        if (roomFacilities) {
            const selectedRoomFacilities = roomFacilities.split(",");
            hotels = hotels.filter(hotel =>
                hotel.roomTypes.some(rt =>
                    selectedRoomFacilities.every(facility =>
                        rt.roomFacilities.includes(facility)
                    )
                )
            );
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            const min = minPrice !== undefined ? parseFloat(minPrice) : 0;
            const max = maxPrice !== undefined ? parseFloat(maxPrice) : Infinity;

            hotels = hotels.filter(hotel =>
                hotel.roomTypes.some(rt =>
                    rt.rooms.some(room => {
                        const price = parseFloat(room.price);
                        return !isNaN(price) && price >= min && price <= max;
                    })
                )
            );
        }
        if (sort) {
            switch (sort) {
                case "priceAsc":
                    hotels.sort((a, b) => getMinPrice(a) - getMinPrice(b));
                    break;
                case "priceDesc":
                    hotels.sort((a, b) => getMinPrice(b) - getMinPrice(a));
                    break;
                case "newest":
                    hotels.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
                default:
                    break;
            }
        }

        const totalHotels = hotels.length;
        const paginatedHotels = hotels.slice(skip, skip + pageSize);

        res.status(200).json({
            totalHotels,
            totalPages: Math.ceil(totalHotels / pageSize),
            currentPage: pageNumber,
            pageSize,
            data: paginatedHotels,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

function getMinPrice(hotel) {
    let minPrice = Infinity;
    for (const roomType of hotel.roomTypes) {
        for (const room of roomType.rooms) {
            if (room.price < minPrice) {
                minPrice = room.price;
            }
        }
    }
    return minPrice === Infinity ? 0 : minPrice;
}

const getAvailableRooms = async (req, res) => {
    const hotelId = req.params.id;
    const {
        checkInDate,
        checkOutDate,
        numRooms,
        numAdults,
    } = req.query;

    try {
        const checkin = new Date(checkInDate);
        const checkout = new Date(checkOutDate);
        const hotel = await Hotel.findById(hotelId).populate("roomTypes");
        if (!hotel) return res.status(404).json({ message: "Hotel not found" });

        const result = [];
        for (const roomType of hotel.roomTypes) {
            const availableRooms = [];
            for (const room of roomType.rooms) {
                const bookings = await HotelBooking.find({
                    hotelId: hotelId,
                    roomTypeId: roomType._id,
                    roomId: room._id,
                    checkin: { $lt: checkout },
                    checkout: { $gt: checkin },
                    bookingStatus: { $in: ['pending', 'confirmed'] }
                })
                const roomsBooked = bookings.reduce((sum, b) => sum + b.numRooms, 0);
                const roomsAvailable = room.numberOfRoom - roomsBooked;

                const numNights = Math.round((checkout - checkin) / (1000 * 3600 * 24));

                if (roomsAvailable >= numRooms) {
                    const price = room.price * numNights * numRooms;
                    availableRooms.push({
                        ...room.toObject(),
                        checkin: checkin,
                        checkout: checkout,
                        totalNights: numNights,
                        totalRooms: Number(numRooms),
                        totalPrice: price,
                        numRoomsAvailable: roomsAvailable
                    });
                }
            }
            if (availableRooms.length > 0) {
                result.push({
                    _id: roomType._id,
                    name: roomType.name,
                    img: roomType.img,
                    area: roomType.area,
                    view: roomType.view,
                    roomFacilities: roomType.roomFacilities,
                    rooms: availableRooms
                });
            }
        }
        return res.status(200).json(result);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
}



export {
    getHotelById,
    listHotel,
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
};