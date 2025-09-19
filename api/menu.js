// Menu API endpoints for Vercel serverless with Neon database
const { queryDBOnce, setCorsHeaders, handleOptions } = require('./_utils');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  setCorsHeaders(res);

  try {
    if (req.method === 'GET') {
      // Get menu items
      const menu = await queryDBOnce('SELECT id, name, price, stock, meta FROM menu ORDER BY created_at');
      const mapped = menu.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        stock: item.stock,
        meta: item.meta || null
      }));
      res.json(mapped);
    } else if (req.method === 'POST') {
      // Add menu item
      const { name, price, stock } = req.body;
      if (!name || price === undefined || stock === undefined) {
        return res.status(400).json({ error: 'Name, price, and stock required' });
      }
      
      const id = 'm-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      await queryDBOnce('INSERT INTO menu (id, name, price, stock) VALUES ($1, $2, $3, $4)', 
                       [id, name, parseFloat(price), parseInt(stock)]);
      res.json({ ok: true, id, name, price, stock });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    console.error('Menu API error:', e);
    res.status(500).json({ error: e.message });
  }
};
