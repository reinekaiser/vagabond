import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import initializeAdmin from "./config/initAdmin.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { app, server } from "./config/socket.js";

import userRoutes from "./routes/userRoutes.js";
import facilityRoute from "./routes/facilityRoute.js";
import cityRoute from "./routes/cityRoutes.js";
import tourRoute from "./routes/tourRoute.js";
import tourBookingRoute from "./routes/tourBookingRoute.js";
import updateRoute from "./routes/uploadRoute.js";
import hotelRoute from "./routes/hotelRoute.js";
import adminAuthRoute from "./routes/adminAuthRoute.js";
import adminRoutes from "./routes/adminRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reviewRoute from "./routes/reviewRoute.js";
import paypalRoute from "./routes/paypalRoute.js";
import stripeRoute from "./routes/stripeRoute.js";
import payosRoute from "./routes/payosRoute.js"
import { handleStripeWebhook } from "./controllers/stripeController.js";

import hotelBookingRoute from "./routes/hotelBookingRoute.js";
import { chat } from "./controllers/chatbotController.js"
import { protect } from "./middleware/authMiddleware.js";

dotenv.config({ path: process.cwd() + "/.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


const corsOptions = {
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
    ],
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.post(
    "/api/stripe/webhook",
    bodyParser.raw({ type: "application/json" }),
    handleStripeWebhook
);

app.use(express.json({ limit: "50mb" }));

await connectDB();

initializeAdmin();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
    res.send("API is running...");
});
console.log("Registering routes:");
app.use("/api/users", userRoutes);
console.log("- /api/users");

app.use("/api/admin", adminAuthRoute);
console.log("- /api/admin (auth routes)");
app.use("/api/admin", adminRoutes);
console.log("- /api/admin (profile routes)");

app.use("/api/facility", facilityRoute);
console.log("- /api/facility");
app.use("/api/cities", cityRoute);

console.log("- /api/cities");
app.use("/api/tour", tourRoute);
app.use("/api/tourBooking", tourBookingRoute);
app.use("/api/hotel", hotelRoute);
app.use("/api/hotelBooking", hotelBookingRoute);
console.log("- /api/hotel");
app.use("/api/img", updateRoute);
console.log("- /api/img");
app.use("/api/messages", messageRoutes);
console.log("- /api/messages");
app.use("/api/dashboard", dashboardRoutes);
console.log("- /api/dashboard");
app.use("/api/reviews", reviewRoute);
console.log("- /api/reviews");
app.use("/api/paypal", paypalRoute);
app.use("/api/stripe", stripeRoute);

app.post("/api/chatbot", protect, chat)

app.use('/api/payos', payosRoute)


app.use((req, res) => {
    console.log("404 Not Found:", req.method, req.url);
    res.status(404).json({
        success: false,
        message: "Route không tồn tại",
    });
});
app.use((err, req, res, next) => {
    console.error("Error:", err.stack);
    res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra từ server",
    });
});

server.listen(port, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
});
