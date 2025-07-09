import express from "express";
import {
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
    getTourStats
} from "../controllers/tourController.js";

const router = express.Router();
router.route("/").post(createTour).get(getTours);
router.route("/suggestion").get(getSearchSuggestions)
router.route("/search").get(getSearchResults)
router.route("/stats").get(getTourStats)
router.route("/:tourId").get(getTourDetail).delete(deleteTour).put(updateTour);
router.route("/:tourId/ticket").post(addTicketToTour);
router.route("/:tourId/ticket/:ticketId").delete(deleteTicketFromTour).put(updateTicketInTour);
export default router;
