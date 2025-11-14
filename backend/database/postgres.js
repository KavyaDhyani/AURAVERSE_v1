// database/postgres.js
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

pool.connect()
  .then(() => console.log("🟢 PostgreSQL Connected"))
  .catch(err => console.error("🔴 Postgres Connection Error:", err));

module.exports = pool;
