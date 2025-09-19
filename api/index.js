// Vercel Serverless API for Shawarma Boss POS
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const app = express();

// Database configuration for Vercel
const DATABASE_URL = process.env.DATABASE_URL || 
  process.env.PGURL || 
  `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgres'}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'shawarma_boss'}`;

// PostgreSQL Database setup
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Enable CORS for development only (not needed for same-origin on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true
  }));
}

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

// Helper function for database queries
async function queryDB(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// API Routes (all prefixed with /api)
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
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Username and password required' });
    }
    
    const users = await queryDB('SELECT username, password, role FROM users WHERE username = $1', [username]);
    const user = users[0];
    
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }
    
    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }
    
    res.json({ ok: true, username: user.username, role: user.role });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
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

// Export for Vercel serverless
module.exports = app;