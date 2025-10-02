// Database test endpoint for Vercel serverless with Neon database
const { queryDBOnce, setCorsHeaders, handleOptions } = require('./_utils');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  setCorsHeaders(res);

  try {
    // Test database connection
    const healthCheck = await queryDBOnce('SELECT NOW() as current_time, version() as db_version');
    
    // Test if tables exist
    const tablesCheck = await queryDBOnce(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'menu', 'orders')
      ORDER BY table_name
    `);
    
    // Test if we have data
    const usersCount = await queryDBOnce('SELECT COUNT(*) as count FROM users');
    const menuCount = await queryDBOnce('SELECT COUNT(*) as count FROM menu');
    const ordersCount = await queryDBOnce('SELECT COUNT(*) as count FROM orders');
    
    res.json({
      ok: true,
      database: {
        connection: 'OK',
        current_time: healthCheck[0].current_time,
        version: healthCheck[0].db_version
      },
      tables: {
        found: tablesCheck.map(t => t.table_name),
        users_count: parseInt(usersCount[0].count),
        menu_count: parseInt(menuCount[0].count),
        orders_count: parseInt(ordersCount[0].count)
      },
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('Database test error:', e);
    res.status(500).json({ 
      ok: false, 
      error: e.message,
      timestamp: new Date().toISOString()
    });
  }
};
