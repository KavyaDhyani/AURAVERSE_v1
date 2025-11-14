// backend/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processMediaFile } = require('../services/mediaProcessor');
const { analyzeAndStoreJSON } = require('../services/jsonProcessor');
const logger = require('../services/logger');

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// -----------------------------
// MEDIA UPLOAD
// -----------------------------
router.post('/media', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log('🔥 HIT /upload/media route');
    const results = [];

    for (const file of req.files) {
      // Delegate processing to mediaProcessor
      const result = await processMediaFile(file, file.buffer);

      // Log upload
      await logger.logUpload('media', {
        filename: file.originalname,
        tags: result.tags,
        category: result.category,
        storage_path: result.storagePath || result.cloudinaryUrl,
        timestamp: new Date().toISOString(),
        mime_type: file.mimetype,
        size: file.size,
      });

      results.push(result);
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error('❌ Media Upload Error:', err);
    await logger.logError(err, { route: '/upload/media' });
    return res.status(500).json({ error: 'Media upload failed', details: err.message });
  }
});

// -----------------------------
// JSON UPLOAD + ANALYSIS
// -----------------------------
router.post('/json', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No JSON file uploaded' });

    console.log('🔥 HIT /upload/json route');
    console.log('Received file:', req.file.originalname);

    const jsonData = JSON.parse(req.file.buffer.toString());

    // Delegate all processing to jsonProcessor
    let result;
    try {
      result = await analyzeAndStoreJSON(jsonData, req.file.originalname);
    } catch (err) {
      console.error('❌ JSON processing failed:', err);
      return res.status(500).json({ error: 'Processing failed', details: err.message });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('❌ JSON Upload Error:', err);
    return res.status(500).json({ error: 'JSON processing failed', details: err.message });
  }
});

module.exports = router;
