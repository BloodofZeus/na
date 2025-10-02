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
      const users = await queryDBOnce('SELECT username, role, meta, created_at FROM users ORDER BY created_at');
      const mapped = users.map(u => ({
        username: u.username,
        role: u.role,
        meta: u.meta || null,
        created_at: u.created_at,
        is_active: u.meta?.is_active !== false // Default to active if not specified
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
      
      await queryDBOnce('INSERT INTO users (username, password, role, meta) VALUES ($1, $2, $3, $4)', 
                       [username, hashedPassword, role, JSON.stringify({ is_active: true })]);
      res.json({ ok: true, username });
    } else if (req.method === 'PUT') {
      // Update staff user
      const { username, role, is_active } = req.body;
      if (!username) {
        return res.status(400).json({ error: 'Username required' });
      }
      
      const meta = { is_active: is_active !== false };
      await queryDBOnce('UPDATE users SET role = $1, meta = $2 WHERE username = $3', 
                       [role, JSON.stringify(meta), username]);
      res.json({ ok: true, username });
    } else if (req.method === 'PATCH') {
      // Reset password
      const { username, newPassword } = req.body;
      if (!username || !newPassword) {
        return res.status(400).json({ error: 'Username and new password required' });
      }
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      await queryDBOnce('UPDATE users SET password = $1 WHERE username = $2', 
                       [hashedPassword, username]);
      res.json({ ok: true, username });
    } else if (req.method === 'DELETE') {
      // Delete staff user
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: 'Username required' });
      }
      
      // Check if user exists
      const user = await queryDBOnce('SELECT username FROM users WHERE username = $1', [username]);
      if (!user || user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      await queryDBOnce('DELETE FROM users WHERE username = $1', [username]);
      res.json({ ok: true, username });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    console.error('Staff API error:', e);
    res.status(500).json({ error: e.message });
  }
};
