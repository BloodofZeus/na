// Menu stock update endpoint for Vercel serverless with Neon database
const { queryDBOnce, setCorsHeaders, handleOptions } = require('../_utils');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  setCorsHeaders(res);

  try {
    if (req.method === 'PUT') {
      // Update menu item stock
      const { id } = req.query;
      const { stock } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Menu item ID required' });
      }
      
      if (stock === undefined || stock === null) {
        return res.status(400).json({ error: 'Stock value required' });
      }
      
      await queryDBOnce('UPDATE menu SET stock = $1, updated_at = NOW() WHERE id = $2', [parseInt(stock), id]);
      res.json({ ok: true, id, stock: parseInt(stock) });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    console.error('Menu stock update error:', e);
    res.status(500).json({ error: e.message });
  }
};
