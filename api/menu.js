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
    } else if (req.method === 'PUT') {
      // Update menu item stock - handle both /menu/:id/stock and /menu with id in body
      const url = req.url || '';
      const pathParts = url.split('/');
      
      let itemId, stock;
      
      if (pathParts.length >= 4 && pathParts[2] === 'menu' && pathParts[4] === 'stock') {
        // Handle /api/menu/:id/stock
        itemId = pathParts[3];
        stock = req.body.stock;
      } else {
        // Handle /api/menu with id in body
        itemId = req.body.id;
        stock = req.body.stock;
      }
      
      if (!itemId) {
        return res.status(400).json({ error: 'Menu item ID required' });
      }
      
      if (stock === undefined || stock === null) {
        return res.status(400).json({ error: 'Stock value required' });
      }
      
      await queryDBOnce('UPDATE menu SET stock = $1, updated_at = NOW() WHERE id = $2', [parseInt(stock), itemId]);
      res.json({ ok: true, id: itemId, stock: parseInt(stock) });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    console.error('Menu API error:', e);
    res.status(500).json({ error: e.message });
  }
};
