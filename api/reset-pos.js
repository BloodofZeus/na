// POS Reset API for admin to clear all test/trial data
const bcrypt = require('bcrypt');
const { createPool, queryDB, setCorsHeaders, handleOptions } = require('./_utils');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  setCorsHeaders(res);

  try {
    const { adminUsername, adminPassword } = req.body;

    if (!adminUsername || !adminPassword) {
      return res.status(400).json({ error: 'Admin username and password are required' });
    }

    const pool = createPool();

    // Verify the user is an admin and password is correct
    const adminCheck = await queryDB(pool, 
      'SELECT username, password, role FROM users WHERE username = $1', 
      [adminUsername]
    );

    if (!adminCheck || adminCheck.length === 0) {
      await pool.end();
      return res.status(403).json({ error: 'Unauthorized. Invalid credentials.' });
    }

    const admin = adminCheck[0];

    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(adminPassword, admin.password);
    if (!isValidPassword) {
      await pool.end();
      return res.status(403).json({ error: 'Unauthorized. Invalid credentials.' });
    }

    // Verify admin role
    if (admin.role !== 'admin') {
      await pool.end();
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Delete all orders
      const ordersResult = await client.query('DELETE FROM orders');
      const ordersDeleted = ordersResult.rowCount;

      // 2. Delete all staff users except the admin making the request
      const staffResult = await client.query(
        'DELETE FROM users WHERE role = $1 AND username != $2',
        ['staff', adminUsername]
      );
      const staffDeleted = staffResult.rowCount;

      // 3. Delete all menu items
      const menuResult = await client.query('DELETE FROM menu');
      const menuDeleted = menuResult.rowCount;

      // 4. Insert default menu items
      const defaultMenu = [
        { id: 'm-1', name: 'Shawarma Wrap', price: 20, stock: 25 },
        { id: 'm-2', name: 'Chicken Shawarma', price: 25, stock: 20 },
        { id: 'm-3', name: 'Beef Shawarma', price: 28, stock: 18 }
      ];

      for (const item of defaultMenu) {
        await client.query(
          'INSERT INTO menu (id, name, price, stock) VALUES ($1, $2, $3, $4)',
          [item.id, item.name, item.price, item.stock]
        );
      }

      // 5. Create default staff user
      const saltRounds = 10;
      const defaultStaffPassword = await bcrypt.hash('staff123', saltRounds);
      await client.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING',
        ['staff1', defaultStaffPassword, 'staff']
      );

      await client.query('COMMIT');

      res.json({
        ok: true,
        message: 'POS system reset successfully',
        details: {
          ordersDeleted,
          staffDeleted,
          menuItemsDeleted: menuDeleted,
          menuItemsCreated: defaultMenu.length,
          defaultStaffCreated: 1
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
      await pool.end();
    }

  } catch (error) {
    console.error('❌ POS reset error:', error);
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
};
