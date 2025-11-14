const axios = require('axios');

const PYTHON_AI_SERVICE_URL = process.env.PYTHON_AI_SERVICE_URL;

/**
 * Calls the Python AI service to get tags for a media file.
 * @param {Buffer} fileBuffer - The file buffer.
 * @param {string} mimeType - The MIME type of the file.
 * @returns {Promise<string[]>} - An array of AI-generated tags.
 */
async function callPythonAIService(fileBuffer, mimeType) {
  // Mock implementation for now
  console.log('Calling Python AI service (mock)');
  return Promise.resolve(['mock-tag-1', 'mock-tag-2', 'mock-tag-3']);

  // Real implementation with retry logic
  /*
  let attempts = 0;
  const maxAttempts = 3;
  const initialDelay = 1000; // 1 second

  while (attempts < maxAttempts) {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, { contentType: mimeType, filename: 'upload' });

      const response = await axios.post(`${PYTHON_AI_SERVICE_URL}/classify`, formData, {
        headers: formData.getHeaders(),
        timeout: 30000, // 30 seconds
      });

      return response.data.tags;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error('AI service is unavailable after multiple attempts.');
      }
      const delay = initialDelay * Math.pow(2, attempts - 1);
      console.log(`AI service call failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  */
}

module.exports = {
  callPythonAIService,
};
