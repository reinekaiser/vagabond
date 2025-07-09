import express from "express";
import cloudinary from "../utils/cloudinary.js"
const router = express.Router();

router.post("/update", async (req, res) => {
    try {
        const files = req.body.data;
        if (!Array.isArray(files)) {
            return res.status(400).json({ error: 'Data must be an array of images' });
        }
        // console.log(files);
        const uploadResults = [];
        for (const fileStr of files) {
            const uploadResponse = await cloudinary.uploader.upload(fileStr, {
                upload_preset: 'ml_default',
                width: 867,
                height: 578,
                crop: 'fill',
                gravity: 'auto',
            });
            uploadResults.push(uploadResponse);
        }
        res.json(uploadResults.map(img => img.public_id));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

router.delete("/delete/*", async (req, res) => {
    const public_id = req.params[0]; // bắt toàn bộ đường dẫn sau /
    if (!public_id) {
        return res.status(400).json({ error: 'Public ID is required' });
    }

    try {
        const deleteResponse = await cloudinary.uploader.destroy(public_id);
        if (deleteResponse.result !== 'ok') {
            return res.status(404).json({ error: 'Image not found or already deleted' });
        }

        res.json({
            success: true,
            message: 'Image deleted successfully',
            result: deleteResponse
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
export default router;