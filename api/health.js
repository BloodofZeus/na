// Health check endpoint for Vercel serverless with Neon database
const { queryDBOnce, setCorsHeaders, handleOptions } = require('./_utils');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  setCorsHeaders(res);

  try {
    // Test database connection with Neon
    await queryDBOnce('SELECT NOW() as current_time, version() as db_version');
    
    res.json({ 
      ok: true, 
      message: 'Shawarma Boss API Running on Vercel with Neon Database', 
      database: 'Neon PostgreSQL',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      ok: false, 
      message: 'Database connection failed', 
      error: error.message,
      database: 'Neon PostgreSQL'
    });
  }
};
