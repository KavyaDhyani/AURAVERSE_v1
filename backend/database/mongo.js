// database/mongo.js
require('dotenv').config();
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectMongo() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.MONGO_DB_NAME);
    console.log("🟢 MongoDB Connected");
  }
  return db;
}

module.exports = connectMongo;
