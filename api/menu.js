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
        meta: item.meta || null,
        is_available: item.meta?.is_available !== false,
        category: item.meta?.category || 'General'
      }));
      res.json(mapped);
    } else if (req.method === 'POST') {
      // Check if this is a duplicate request
      if (req.body.duplicateFrom) {
        // Duplicate menu item
        const { duplicateFrom } = req.body;
        const original = await queryDBOnce('SELECT * FROM menu WHERE id = $1', [duplicateFrom]);
        if (!original || original.length === 0) {
          return res.status(404).json({ error: 'Menu item not found' });
        }
        
        const item = original[0];
        const newId = 'm-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const newName = item.name + ' (Copy)';
        
        await queryDBOnce(
          'INSERT INTO menu (id, name, price, stock, meta) VALUES ($1, $2, $3, $4, $5)', 
          [newId, newName, item.price, item.stock, item.meta]
        );
        res.json({ ok: true, id: newId, name: newName, price: item.price, stock: item.stock });
      } else {
        // Add new menu item
        const { name, price, stock, category } = req.body;
        if (!name || price === undefined || stock === undefined) {
          return res.status(400).json({ error: 'Name, price, and stock required' });
        }
        
        const id = 'm-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const meta = { category: category || 'General', is_available: true };
        
        await queryDBOnce(
          'INSERT INTO menu (id, name, price, stock, meta) VALUES ($1, $2, $3, $4, $5)', 
          [id, name, parseFloat(price), parseInt(stock), JSON.stringify(meta)]
        );
        res.json({ ok: true, id, name, price, stock });
      }
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
    } else if (req.method === 'PATCH') {
      // Update menu item details (name, price, category, availability)
      const { id, name, price, category, is_available } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Menu item ID required' });
      }
      
      // Get current item to merge metadata
      const current = await queryDBOnce('SELECT meta FROM menu WHERE id = $1', [id]);
      if (!current || current.length === 0) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      
      const currentMeta = current[0].meta || {};
      const updatedMeta = {
        ...currentMeta,
        ...(category !== undefined && { category }),
        ...(is_available !== undefined && { is_available })
      };
      
      // Build dynamic update query
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }
      if (price !== undefined) {
        updates.push(`price = $${paramCount++}`);
        values.push(parseFloat(price));
      }
      if (Object.keys(updatedMeta).length > 0) {
        updates.push(`meta = $${paramCount++}`);
        values.push(JSON.stringify(updatedMeta));
      }
      
      updates.push(`updated_at = NOW()`);
      values.push(id);
      
      const query = `UPDATE menu SET ${updates.join(', ')} WHERE id = $${paramCount}`;
      await queryDBOnce(query, values);
      
      res.json({ ok: true, id });
    } else if (req.method === 'DELETE') {
      // Delete menu item
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Menu item ID required' });
      }
      
      // Check if item exists
      const item = await queryDBOnce('SELECT id FROM menu WHERE id = $1', [id]);
      if (!item || item.length === 0) {
        return res.status(404).json({ error: 'Menu item not found' });
      }
      
      await queryDBOnce('DELETE FROM menu WHERE id = $1', [id]);
      res.json({ ok: true, id });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    console.error('Menu API error:', e);
    res.status(500).json({ error: e.message });
  }
};
