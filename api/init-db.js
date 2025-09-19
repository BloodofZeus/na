// Database initialization for Vercel serverless with Neon database
const bcrypt = require('bcrypt');
const { createPool, queryDB, setCorsHeaders, handleOptions } = require('./_utils');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  setCorsHeaders(res);

  try {
    const pool = createPool();
    
    // Create tables if they don't exist
    await queryDB(pool, `
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(50) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'staff',
        meta JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryDB(pool, `
      CREATE TABLE IF NOT EXISTS menu (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 0,
        meta JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await queryDB(pool, `
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        staff VARCHAR(50),
        timestamp TIMESTAMP DEFAULT NOW(),
        total DECIMAL(10,2) NOT NULL DEFAULT 0,
        payload JSONB,
        server_received_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (staff) REFERENCES users(username)
      )
    `);

    // Create indexes for better performance
    await queryDB(pool, `CREATE INDEX IF NOT EXISTS idx_orders_staff ON orders(staff)`);
    await queryDB(pool, `CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp)`);
    await queryDB(pool, `CREATE INDEX IF NOT EXISTS idx_menu_stock ON menu(stock)`);

    // Insert default data only in development mode
    if (process.env.NODE_ENV !== 'production') {
      const userCount = await queryDB(pool, 'SELECT COUNT(*) as count FROM users');
      if (parseInt(userCount[0].count) === 0) {
        const saltRounds = 10;
        const defaultUsers = [
          { username: 'admin', password: await bcrypt.hash('admin123', saltRounds), role: 'admin' },
          { username: 'staff1', password: await bcrypt.hash('staff123', saltRounds), role: 'staff' }
        ];
        
        for (const user of defaultUsers) {
          await queryDB(pool,
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
            [user.username, user.password, user.role]
          );
        }
        console.log('✅ Default users created (development only)');
      }
    }

    const menuCount = await queryDB(pool, 'SELECT COUNT(*) as count FROM menu');
    if (parseInt(menuCount[0].count) === 0) {
      const defaultMenu = [
        { id: 'm-1', name: 'Shawarma Wrap', price: 20, stock: 25 },
        { id: 'm-2', name: 'Chicken Shawarma', price: 25, stock: 20 },
        { id: 'm-3', name: 'Beef Shawarma', price: 28, stock: 18 }
      ];
      
      for (const item of defaultMenu) {
        await queryDB(pool,
          'INSERT INTO menu (id, name, price, stock) VALUES ($1, $2, $3, $4)',
          [item.id, item.name, item.price, item.stock]
        );
      }
      console.log('✅ Default menu items created');
    }

    await pool.end(); // Close connection

    res.json({ 
      ok: true, 
      message: 'Neon database initialized successfully',
      database: 'Neon PostgreSQL',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    res.status(500).json({ 
      ok: false, 
      error: error.message,
      database: 'Neon PostgreSQL'
    });
  }
};
