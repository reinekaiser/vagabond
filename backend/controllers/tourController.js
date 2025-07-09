import Tour from "../models/tour.js";
import Ticket from "../models/ticket.js";
import City from "../models/city.js";

const createTour = async (req, res) => {
    try {
        const {
            name,
            category,
            location,
            city,
            duration,
            experiences,
            languageService,
            contact,
            suitableFor,
            additionalInformation,
            itinerary,
            tickets,
            fromPrice,
            images,
        } = req.body;
        if (
            !name ||
            !location ||
            !city ||
            !duration ||
            !itinerary ||
            !tickets ||
            tickets.length === 0
        ) {
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc hoặc chưa có vé" });
        }

        const ticketIds = [];
        for (const ticketData of tickets) {
            const ticket = new Ticket(ticketData);
            await ticket.save();
            ticketIds.push(ticket._id);
        }

        const tour = Tour({
            name,
            category,
            location,
            city,
            duration,
            experiences,
            languageService,
            contact,
            suitableFor,
            additionalInformation,
            itinerary,
            images,
            tickets: ticketIds,
            fromPrice,
        });

        await tour.save();
        res.status(201).json(tour);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server", details: error.message });
        if (tickets.length > 0) {
            try {
                await Ticket.deleteMany({ _id: { $in: ticketIds } });
                console.log("Rollback vé đã tạo");
            } catch (deleteError) {
                console.error("Lỗi rollback vé:", deleteError.message);
            }
        }
    }
};

const addTicketToTour = async (req, res) => {
    try {
        const { title, prices } = req.body;
        if (!title || !prices) {
            return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
        }

        const tour = await Tour.findById(req.params.tourId);
        if (!tour) {
            return res.status(404).json({ error: "Tour không tồn tại" });
        }

        const ticket = new Ticket(req.body);
        await ticket.save();
        tour.tickets.push(ticket._id);
        await tour.save();

        res.status(201).json(ticket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
};

const deleteTicketFromTour = async (req, res) => {
    try {
        const { tourId, ticketId } = req.params;
        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({ error: "Tour không tồn tại" });
        }

        const ticketIndex = tour.tickets.indexOf(ticketId);
        if (ticketIndex === -1) {
            return res.status(400).json({ error: "Vé không có trong tour" });
        }

        tour.tickets.splice(ticketIndex, 1);
        await tour.save();
        const ticket = await Ticket.findByIdAndDelete(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Vé không tồn tại" });
        }

        if (tour.tickets.length === 0) {
            await Tour.findByIdAndDelete(tourId);
            return res.status(200).json({
                message: "Xóa vé và xóa tour vì tour không còn vé",
            });
        }

        res.status(200).json(tour);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
};

const updateTicketInTour = async (req, res) => {
    try {
        const { tourId, ticketId } = req.params;

        const tour = await Tour.findById(tourId); // thêm await
        if (!tour) {
            return res.status(400).json({ error: "Tour không tồn tại" });
        }

        const ticketIndex = tour.tickets.findIndex((id) => id.toString() === ticketId);
        if (ticketIndex === -1) {
            return res.status(400).json({ error: "Vé không có trong tour" });
        }

        // Cập nhật vé
        const { createdAt, updatedAt, ...safeBody } = req.body;
        const updatedTicket = await Ticket.findByIdAndUpdate(ticketId, safeBody, {
            new: true,
            runValidators: true,
        });

        if (!updatedTicket) {
            return res.status(404).json({ message: "Vé không tồn tại" });
        }
        await tour.save();

        res.status(200).json(updatedTicket);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
};

const deleteTour = async (req, res) => {
    try {
        const { tourId } = req.params;

        const tour = await Tour.findById(tourId);
        if (!tour) {
            return res.status(404).json({ message: "Tour không tồn tại" });
        }

        await Ticket.deleteMany({ _id: { $in: tour.tickets } });
        await Tour.findByIdAndDelete(tourId);
        res.status(200).json({ message: "Đã xóa tour và các vé liên quan" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi server", details: error.message });
    }
};

const updateTour = async (req, res) => {
    const { tourId } = req.params;
    const { name, location, city, duration, itinerary } = req.body;

    if (!name || !location || !city || !duration || !itinerary) {
        return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    const updatedTour = await Tour.findByIdAndUpdate(tourId, req.body, {
        new: true,
    });

    if (!updatedTour) {
        return res.status(404).json({ message: "Tour không tồn tại" });
    }

    res.status(200).json(updatedTour);
};

const getSearchSuggestions = async (req, res) => {
    try {
        const { q } = req.query;
        const tours = await Tour.aggregate([
            {
                $search: {
                    index: "search_tour",
                    text: {
                        query: q,
                        path: ["name", "category", "location", "experiences"],
                        fuzzy: {},
                    },
                },
            },
            {
                $limit: 3,
            },
            {
                $lookup: {
                    from: "tickets",
                    localField: "tickets",
                    foreignField: "_id",
                    as: "ticketDetails",
                    pipeline: [
                        { $sort: { createdAt: -1 } },
                        { $limit: 3 },
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                                prices: 1,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    name: 1,
                    location: 1,
                    images: 1,
                    ticketDetails: 1,
                },
            },
        ]);

        const cities = await City.find({
            name: { $regex: q, $options: "i" },
        }).select("_id name");

        res.status(200).json({ tours, cities });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

const getSearchResults = async (req, res) => {
    try {
        const { query, minPrice, maxPrice, category, language, duration, sort } = req.query;

        let matchStage = {};
        if (query) {
            matchStage = {
                $search: {
                    index: "search_tour",
                    text: {
                        query: query,
                        path: ["name", "category", "location"],
                        fuzzy: {},
                    },
                },
            };
        }

        let filterStage = { $match: {} };

        if (minPrice) filterStage.$match.fromPrice = { $gte: Number(minPrice) };
        if (maxPrice)
            filterStage.$match.fromPrice = {
                ...(filterStage.$match.fromPrice || {}),
                $lte: Number(maxPrice),
            };
        if (category) filterStage.$match.category = { $in: category.split(",") };
        if (language) filterStage.$match.languageService = { $in: language.split(",") };
        if (duration) {
            switch (duration) {
                case "0-3": {
                    filterStage.$match.durationInHours = { $gte: 0, $lte: 3 };
                    break;
                }
                case "3-5": {
                    filterStage.$match.durationInHours = { $gte: 3, $lte: 5 };
                    break;
                }
                case "5-7": {
                    filterStage.$match.durationInHours = { $gte: 5, $lte: 7 };
                    break;
                }
                case "1-day": {
                    filterStage.$match.durationInHours = { $gte: 24, $lte: 48 };
                    break;
                }
                case "2-days-plus": {
                    filterStage.$match.durationInHours = { $gte: 24 };
                    break;
                }
                default:
                    break;
            }
        }

        let sortStage;

        if (!sort || sort === "relevance") {
            // Sắp xếp theo độ khớp (mặc định nếu không có sort hoặc sort=relevance)
            sortStage = { $sort: { score: { $meta: "textScore" } } };
        } else if (sort === "new") {
            sortStage = { $sort: { createdAt: -1 } };
        } else if (sort === "rating") {
            sortStage = { $sort: { avgRating: -1 } };
        } else if (sort === "price") {
            sortStage = { $sort: { fromPrice: 1 } };
        }

        const pageNumber = Number(req.query.page) || 1;
        const limit = Number(req.query.pageSize) || 6;
        1;
        const skip = (pageNumber - 1) * limit;

        const results = await Tour.aggregate([
            matchStage,
            filterStage,
            {
                $facet: {
                    data: [
                        ...(sortStage ? [sortStage] : []),
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                name: 1,
                                location: 1,
                                images: 1,
                                price: 1,
                                category: 1,
                                languageService: 1,
                                duration: 1,
                                fromPrice: 1,
                            },
                        },
                    ],
                    totalCount: [{ $count: "count" }],
                },
            },
        ]);

        const tours = results[0].data;
        const total = results[0].totalCount[0]?.count || 0;
        const totalPages = Math.ceil(total / limit);

        res.json({
            tours: tours,
            totalPages: totalPages,
            page: pageNumber,
            total: total,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

const getTours = async (req, res) => {
    try {
        const {
            category,
            languageService,
            minPrice,
            maxPrice,
            duration,
            page,
            limit,
            sort,
            cityId
        } = req.query;

        let filter = {};

        if (category) {
            filter.category = { $in: category.split(",") };
        }

        if (languageService) {
            filter.languageService = { $in: languageService.split(",") };
        }

        if (minPrice || maxPrice) {
            filter.fromPrice = {};
            if (minPrice) filter.fromPrice.$gte = parseFloat(minPrice);
            if (maxPrice) filter.fromPrice.$lte = parseFloat(maxPrice);
        }

        if (duration) {
            switch (duration) {
                case "0-3": {
                    filter.durationInHours = { $gte: 0, $lte: 3 };
                    break;
                }
                case "3-5": {
                    filter.durationInHours = { $gte: 3, $lte: 5 };
                    break;
                }
                case "5-7": {
                    filter.durationInHours = { $gte: 5, $lte: 7 };
                    break;
                }
                case "1-day": {
                    filter.durationInHours = { $gte: 24, $lte: 48 };
                    break;
                }
                case "2-days-plus": {
                    filter.durationInHours = { $gte: 24 };
                    break;
                }
                default:
                    break;
            }
        }

        if (cityId) {
            filter.city = cityId;
        }

        const pageNumber = Number(page) || 1;
        const pageSize = Number(limit) || 15;
        const skip = (pageNumber - 1) * pageSize;

        let sortOptions = {};
        if (sort) {
            switch (sort) {
                case "price":
                    sortOptions = { fromPrice: 1 };
                    break;
                case "rating":
                    sortOptions = { avgRating: -1 };
                    break;
                case "newest":
                    sortOptions = { createdAt: -1 };
                    break;
                case "popular":
                    sortOptions = { bookings: -1 };
                    break;
                default:
                    sortOptions = { bookings: -1 };
            }
        }

        const tours = await Tour.find(filter).sort(sortOptions).skip(skip).limit(pageSize);
        const totalTours = await Tour.countDocuments(filter);

        res.status(200).json({
            totalTours,
            totalPages: Math.ceil(totalTours / pageSize),
            currentPage: pageNumber,
            pageSize,
            data: tours,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Lỗi server", error });
    }
};

const getTourDetail = async (req, res) => {
    try {
        const { tourId } = req.params;
        const tour = await Tour.findById(tourId);

        if (!tour) {
            return res.status(404).json({ message: "Tour không tồn tại" });
        }

        const tickets = await Ticket.find({ _id: { $in: tour.tickets } });
        res.json({ tour, tickets });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Lỗi server", error });
    }
};

const getTourStats = async (req, res) => {
    try {
        const totalCount = await Tour.countDocuments();

        const [topRated, cheapest, newest] = await Promise.all([
            Tour.find().sort({ averageRating: -1 }).limit(3).select("name _id"),
            Tour.find().sort({ fromPrice: 1 }).limit(3).select("name _id"),
            Tour.find().sort({ createdAt: -1 }).limit(3).select("name _id createdAt"),
        ]);

        res.json({
            totalCount,
            topRatedTours: topRated,
            cheapestTours: cheapest,
            newestTours: newest,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server khi lấy thống kê tour" });
    }
};

export {
    createTour,
    addTicketToTour,
    updateTicketInTour,
    deleteTicketFromTour,
    updateTour,
    deleteTour,
    getSearchSuggestions,
    getSearchResults,
    getTours,
    getTourDetail,
    getTourStats,
};
