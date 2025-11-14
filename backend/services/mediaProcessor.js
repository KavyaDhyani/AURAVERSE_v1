// backend/services/mediaProcessor.js
const { v2: cloudinary } = require('cloudinary');
const { callPythonAIService } = require('./aiClient');
const logger = require('./logger');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Processes a single media file:
 * - Uploads to Cloudinary
 * - Sends to Python AI for tags/category
 * - Logs and returns structured result
 * @param {object} file - Multer file object
 * @param {Buffer} buffer - File buffer
 */
async function processMediaFile(file, buffer) {
  try {
    console.log(`Processing media file: ${file.originalname}`);

    // 1️⃣ Upload to Cloudinary
    const cloudResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'Auraverse/Images' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    console.log('✅ Uploaded to Cloudinary:', cloudResult.secure_url);

    // 2️⃣ Call Python AI service
    const aiTags = await callPythonAIService(buffer, file.mimetype);

    // Derive category: first tag or default
    const category = aiTags[0] || 'Uncategorized';

    // 3️⃣ Prepare structured result
    const result = {
      filename: file.originalname,
      cloudinaryUrl: cloudResult.secure_url,
      tags: aiTags,
      category,
      status: 'processed',
      storagePath: cloudResult.public_id,
    };

    // 4️⃣ Log upload event
    await logger.logUpload('media', {
      filename: file.originalname,
      tags: aiTags,
      category,
      storage_path: cloudResult.public_id,
      timestamp: new Date().toISOString(),
      mime_type: file.mimetype,
      size: file.size,
    });

    return result;

  } catch (err) {
    console.error('❌ Media processing failed:', err);
    await logger.logError(err, { file: file.originalname, type: 'media' });
    throw err;
  }
}

module.exports = {
  processMediaFile,
};
