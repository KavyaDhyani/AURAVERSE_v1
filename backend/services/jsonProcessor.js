// backend/services/jsonProcessor.js
const logger = require('./logger');
const schemaAnalyzer = require('./schemaAnalyzer');
const pool = require('../database/postgres');
const connectMongo = require('../database/mongo');

/**
 * Analyzes and stores a JSON file:
 * - Determines SQL vs NoSQL via schemaAnalyzer
 * - Stores in PostgreSQL or MongoDB
 * - Logs the upload
 * @param {object} jsonData - Parsed JSON object
 * @param {string} filename - Original filename
 */
async function analyzeAndStoreJSON(jsonData, filename) {
  try {
    console.log(`Processing JSON file: ${filename}`);

    // 1️⃣ Analyze schema
    const analysis = schemaAnalyzer.analyzeJSON(jsonData);

    // 2️⃣ Decide database
    const useSQL = analysis.structure === 'flat';
    let dbResult;

    if (useSQL) {
      // PostgreSQL storage
      const keys = Object.keys(analysis.schema);
      const cols = keys.map(k => `"${k}" TEXT`).join(', ');

      // Create table if not exists
      await pool.query(`CREATE TABLE IF NOT EXISTS json_data (${cols})`);

      // Insert values
      const values = keys.map(k => `'${jsonData[k]}'`).join(', ');
      await pool.query(`INSERT INTO json_data VALUES (${values})`);

      dbResult = 'Stored in PostgreSQL';
    } else {
      // MongoDB storage
      const db = await connectMongo();
      await db.collection('json_data').insertOne(jsonData);
      dbResult = 'Stored in MongoDB';
    }

    // 3️⃣ Log JSON upload
    await logger.logUpload('json', {
      filename,
      db_type: useSQL ? 'PostgreSQL' : 'MongoDB',
      keys: Object.keys(analysis.schema),
      nested: analysis.summary.nested,
      timestamp: new Date().toISOString(),
      status: 'processed',
    });

    // 4️⃣ Return structured result
    return {
      filename,
      status: 'processed',
      database: useSQL ? 'PostgreSQL' : 'MongoDB',
      schema: analysis.schema,
      summary: analysis.summary,
      dbResult,
    };

  } catch (err) {
    console.error('❌ JSON processing failed:', err);
    await logger.logError(err, { file: filename, type: 'json' });
    throw err;
  }
}

module.exports = {
  analyzeAndStoreJSON,
};
