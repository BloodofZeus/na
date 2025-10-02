// Login endpoint for Vercel serverless with Neon database
const bcrypt = require('bcrypt');
const { queryDBOnce, setCorsHeaders, handleOptions } = require('./_utils');

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
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, error: 'Please enter both username and password' });
    }
    
    const users = await queryDBOnce('SELECT username, password, role FROM users WHERE username = $1', [username]);
    const user = users[0];
    
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid username or password' });
    }
    
    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ ok: false, error: 'Invalid username or password' });
    }
    
    res.json({ ok: true, username: user.username, role: user.role });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ ok: false, error: 'Server error. Please try again later.' });
  }
};
