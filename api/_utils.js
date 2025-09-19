// Shared utilities for Vercel serverless functions
const { Pool } = require('pg');

// Database connection configuration optimized for Neon serverless
const getDatabaseConfig = () => {
  // Priority order for Neon database connection
  const DATABASE_URL = process.env.DATABASE_URL || 
    process.env.POSTGRES_URL || 
    process.env.POSTGRES_PRISMA_URL ||
    process.env.PGURL || 
    `postgresql://${process.env.PGUSER || process.env.POSTGRES_USER || 'postgres'}:${process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.PGHOST || process.env.POSTGRES_HOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || process.env.POSTGRES_DATABASE || 'neondb'}`;

  return {
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 1, // Limit connections for serverless
    idleTimeoutMillis: 10000, // Reduced for Neon
    connectionTimeoutMillis: 5000, // Increased for Neon
    allowExitOnIdle: true, // Allow pool to close when idle
    statement_timeout: 30000, // 30 second timeout
    query_timeout: 30000, // 30 second timeout
  };
};

// Create database pool
const createPool = () => {
  return new Pool(getDatabaseConfig());
};

// Helper function for database queries with error handling optimized for Neon
const queryDB = async (pool, sql, params = []) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

// Helper function for single queries (for serverless functions)
const queryDBOnce = async (sql, params = []) => {
  const pool = createPool();
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Set CORS headers
const setCorsHeaders = (res) => {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
};

// Handle OPTIONS requests for CORS
const handleOptions = (res) => {
  setCorsHeaders(res);
  res.status(200).end();
};

module.exports = {
  createPool,
  queryDB,
  queryDBOnce,
  setCorsHeaders,
  handleOptions,
  getDatabaseConfig
};
