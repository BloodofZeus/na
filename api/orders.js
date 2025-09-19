// Orders API endpoints for Vercel serverless with Neon database
const { queryDBOnce, setCorsHeaders, handleOptions } = require('./_utils');

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  setCorsHeaders(res);

  try {
    if (req.method === 'GET') {
      // Get orders/sales
      const orders = await queryDBOnce('SELECT id, staff, timestamp, total, payload, server_received_at FROM orders ORDER BY server_received_at DESC LIMIT 500');
      const mapped = orders.map(o => ({
        id: o.id,
        staff: o.staff,
        timestamp: o.timestamp,
        total: o.total,
        payload: o.payload || null,
        serverReceivedAt: o.server_received_at
      }));
      res.json(mapped);
    } else if (req.method === 'POST') {
      // Add order
      const order = req.body;
      if (!order || !order.id) {
        return res.status(400).json({ error: 'Order with ID required' });
      }
      
      const payload = order;
      const serverReceivedAt = new Date().toISOString();
      
      await queryDBOnce('INSERT INTO orders (id, staff, timestamp, total, payload, server_received_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
                       [order.id, order.user || order.staff || '', order.timestamp || new Date().toISOString(), order.total || 0, JSON.stringify(payload), serverReceivedAt]);
      
      res.json({ ok: true, id: order.id });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    console.error('Orders API error:', e);
    res.status(500).json({ error: e.message });
  }
};
