require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const { v2: cloudinary } = require("cloudinary");

// Import routes
const uploadRoutes = require("./routes/upload");
const dataRoutes = require("./routes/data");

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/upload', uploadRoutes);

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ----------------------------------------
// 🔥 MERGED: /upload/image route with Cloudinary + Flask AI
// ----------------------------------------

app.post("/upload/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert buffer to temp file (Cloudinary requires a path)
    const tempPath = `uploads/${Date.now()}-${req.file.originalname}`;
    fs.writeFileSync(tempPath, req.file.buffer);

    // 1. Upload to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(tempPath, {
      folder: "Auraverse/Images",
      resource_type: "image",
    });

    console.log("Cloudinary Upload URL:", cloudinaryResult.secure_url);

    // 2. Send to Flask AI microservice
    const form = new FormData();
    form.append("image", fs.createReadStream(tempPath));

    const aiRes = await axios.post("http://127.0.0.1:5000/classify", form, {
      headers: form.getHeaders(),
    });

    // Cleanup local temp file
    fs.unlinkSync(tempPath);

    // Response back to frontend
    return res.json({
      message: "Upload successful",
      cloudinaryUrl: cloudinaryResult.secure_url,
      tags: aiRes.data,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return res.status(500).json({ error: "Upload failed", details: error });
  }
});

// ----------------------------------------
// Existing Route System
// ----------------------------------------
app.use("/upload", upload.any(), uploadRoutes);
app.use("/", dataRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
