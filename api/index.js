// Vercel Serverless API for Shawarma Boss POS
// Try to load .env from parent directory (local dev) or current directory (Vercel)
const path = require('path');
const fs = require('fs');

// Check if .env exists in parent directory (local development)
const parentEnvPath = path.join(__dirname, '..', '.env');
const currentEnvPath = path.join(__dirname, '.env');

if (fs.existsSync(parentEnvPath)) {
  require('dotenv').config({ path: parentEnvPath });
} else if (fs.existsSync(currentEnvPath)) {
  require('dotenv').config({ path: currentEnvPath });
} else {
  // Fallback to default dotenv behavior
  require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();

// Database configuration for Vercel
const DATABASE_URL = process.env.DATABASE_URL || 
  process.env.PGURL || 
  `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'shawarma_boss'}`;

// PostgreSQL Database setup with connection pooling for Vercel
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Connection pooling settings for serverless
  max: 1, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  // For Neon.tech specifically
  allowExitOnIdle: true, // Allow the process to exit when all connections are idle
});

// Enable CORS for all environments
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all origins in production (Vercel)
    : ['http://localhost:3000', 'http://localhost:5000'], // Specific origins in development
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Flag to ensure database initialization runs only once
let dbInitialized = false;

// Initialize database tables and default data
async function initializeDatabase() {
  if (dbInitialized) return;
  dbInitialized = true;
  try {
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(50) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'staff',
        meta JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
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

    await pool.query(`
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
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_staff ON orders(staff)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_menu_stock ON menu(stock)`);

    // Insert default data only in development mode
    if (process.env.NODE_ENV !== 'production') {
      const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
      if (parseInt(userCount.rows[0].count) === 0) {
        const saltRounds = 10;
        const defaultUsers = [
          { username: 'admin', password: await bcrypt.hash('admin123', saltRounds), role: 'admin' },
          { username: 'staff1', password: await bcrypt.hash('staff123', saltRounds), role: 'staff' }
        ];
        
        for (const user of defaultUsers) {
          await pool.query(
            'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
            [user.username, user.password, user.role]
          );
        }
        console.log('✅ Default users created (development only)');
      }
    }

    const menuCount = await pool.query('SELECT COUNT(*) as count FROM menu');
    if (parseInt(menuCount.rows[0].count) === 0) {
      const defaultMenu = [
        { id: 'm-1', name: 'Shawarma Wrap', price: 20, stock: 25 },
        { id: 'm-2', name: 'Chicken Shawarma', price: 25, stock: 20 },
        { id: 'm-3', name: 'Beef Shawarma', price: 28, stock: 18 }
      ];
      
      for (const item of defaultMenu) {
        await pool.query(
          'INSERT INTO menu (id, name, price, stock) VALUES ($1, $2, $3, $4)',
          [item.id, item.name, item.price, item.stock]
        );
      }
      console.log('✅ Default menu items created');
    }

    console.log('🗄️ PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Initialize database on startup
initializeDatabase();

// Cleanup function for serverless environment
const cleanup = async () => {
  try {
    await pool.end();
    console.log('Database pool closed');
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// Helper function for database queries with timeout
async function queryDB(sql, params = []) {
  try {
    // Add timeout to prevent hanging requests
    const queryPromise = pool.query(sql, params);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Query timeout')), 5000)
    );
    
    const result = await Promise.race([queryPromise, timeoutPromise]);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// API Routes (all prefixed with /api)
app.get('/', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Shawarma Boss API is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'API is working', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'not set'
  });
});

app.get('/api/debug', async (req, res) => {
  try {
    // Test database connection
    const dbTest = await pool.query('SELECT NOW() as current_time');
    
    // Check if users table exists and has data
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    
    res.json({
      ok: true,
      database: {
        connected: true,
        currentTime: dbTest.rows[0].current_time,
        userCount: parseInt(userCount.rows[0].count)
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'not set'
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
      details: error.toString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    res.json({ 
      ok: true, 
      message: 'Shawarma Boss API Running on Vercel', 
      database: 'PostgreSQL',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      message: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Login endpoint with secure password verification
app.post('/api/login', async (req, res) => {
  try {
    console.log('Login attempt:', { username: req.body?.username, hasPassword: !!req.body?.password });
    
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Username and password required' });
    }
    
    // Test database connection first
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    
    const users = await queryDB('SELECT username, password, role FROM users WHERE username = $1', [username]);
    const user = users[0];
    
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }
    
    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', username);
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }
    
    console.log('Login successful for user:', username);
    res.json({ ok: true, username: user.username, role: user.role });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ ok: false, error: e.message, details: e.toString() });
  }
});

// Get staff/users
app.get('/api/staff', async (req, res) => {
  try {
    const users = await queryDB('SELECT username, role, meta FROM users ORDER BY created_at');
    const mapped = users.map(u => ({
      username: u.username,
      role: u.role,
      meta: u.meta || null
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add staff user with password hashing
app.post('/api/staff', async (req, res) => {
  try {
    const { username, password, role = 'staff' } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    await queryDB('INSERT INTO users (username, password, role) VALUES ($1, $2, $3)', 
                   [username, hashedPassword, role]);
    res.json({ ok: true, username });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get menu
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await queryDB('SELECT id, name, price, stock, meta FROM menu ORDER BY created_at');
    const mapped = menu.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      stock: item.stock,
      meta: item.meta || null
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add menu item
app.post('/api/menu', async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ error: 'Name, price, and stock required' });
    }
    
    const id = 'm-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    await queryDB('INSERT INTO menu (id, name, price, stock) VALUES ($1, $2, $3, $4)', 
                   [id, name, parseFloat(price), parseInt(stock)]);
    res.json({ ok: true, id, name, price, stock });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update menu item stock
app.put('/api/menu/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    await queryDB('UPDATE menu SET stock = $1, updated_at = NOW() WHERE id = $2', [parseInt(stock), id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get orders/sales
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await queryDB('SELECT id, staff, timestamp, total, payload, server_received_at FROM orders ORDER BY server_received_at DESC LIMIT 500');
    const mapped = orders.map(o => ({
      id: o.id,
      staff: o.staff,
      timestamp: o.timestamp,
      total: o.total,
      payload: o.payload || null,
      serverReceivedAt: o.server_received_at
    }));
    res.json(mapped);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add order
app.post('/api/orders', async (req, res) => {
  try {
    const order = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ error: 'Order with ID required' });
    }
    
    const payload = order;
    const serverReceivedAt = new Date().toISOString();
    
    await queryDB('INSERT INTO orders (id, staff, timestamp, total, payload, server_received_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
                   [order.id, order.user || order.staff || '', order.timestamp || new Date().toISOString(), order.total || 0, JSON.stringify(payload), serverReceivedAt]);
    
    res.json({ ok: true, id: order.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Start server for local development
if (require.main === module) {
  const PORT = 3001; // Use port 3001 for backend to avoid conflict with frontend
  app.listen(PORT, () => {
    console.log(`🚀 Shawarma Boss API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}

// Export for Vercel serverless
module.exports = app;