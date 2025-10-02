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

      // Reset complete - no default data created
      await client.query('COMMIT');

      res.json({
        ok: true,
        message: 'POS system reset successfully - all data cleared',
        details: {
          ordersDeleted,
          staffDeleted,
          menuItemsDeleted: menuDeleted
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
