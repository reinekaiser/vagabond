import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Kết nối MongoDB
const url = process.env.MONGO_URI || "mongodb://localhost:27017/vagabond";

const connectDB = async () => {
    try {
        await mongoose.connect(url,
            { dbName: "Vagabound" }
        );
        console.log("✅ Kết nối MongoDB thành công!");

    } catch (error) {
        console.error("❌ Lỗi kết nối MongoDB:", error);
    }
};

export default connectDB;