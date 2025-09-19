// Staff API endpoints for Vercel serverless with Neon database
const bcrypt = require('bcrypt');
const { queryDBOnce, setCorsHeaders, handleOptions } = require('./_utils');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  setCorsHeaders(res);

  try {
    if (req.method === 'GET') {
      // Get staff/users
      const users = await queryDBOnce('SELECT username, role, meta FROM users ORDER BY created_at');
      const mapped = users.map(u => ({
        username: u.username,
        role: u.role,
        meta: u.meta || null
      }));
      res.json(mapped);
    } else if (req.method === 'POST') {
      // Add staff user with password hashing
      const { username, password, role = 'staff' } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      await queryDBOnce('INSERT INTO users (username, password, role) VALUES ($1, $2, $3)', 
                       [username, hashedPassword, role]);
      res.json({ ok: true, username });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    console.error('Staff API error:', e);
    res.status(500).json({ error: e.message });
  }
};
