const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

/**
 * Utility to run queries with error wrapping
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.debug('[DB Query]:', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('[DB Error]:', err.message);
    throw err;
  }
};

module.exports = {
  pool,
  query
};