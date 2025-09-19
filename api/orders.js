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
      console.log('Orders API: Received order data:', order);
      
      if (!order || !order.id) {
        console.log('Orders API: Missing order or order.id');
        return res.status(400).json({ error: 'Order with ID required' });
      }
      
      const payload = order;
      const serverReceivedAt = new Date().toISOString();
      
      console.log('Orders API: Inserting order with data:', {
        id: order.id,
        staff: order.user || order.staff || '',
        timestamp: order.timestamp || new Date().toISOString(),
        total: order.total || 0,
        payload: JSON.stringify(payload),
        serverReceivedAt
      });
      
      await queryDBOnce('INSERT INTO orders (id, staff, timestamp, total, payload, server_received_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
                       [order.id, order.user || order.staff || '', order.timestamp || new Date().toISOString(), order.total || 0, JSON.stringify(payload), serverReceivedAt]);
      
      console.log('Orders API: Order inserted successfully');
      res.json({ ok: true, id: order.id });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (e) {
    console.error('Orders API error:', e);
    
    // Provide more specific error messages
    let errorMessage = e.message;
    if (e.message && e.message.includes('foreign key constraint')) {
      errorMessage = 'User not found. Please log in again.';
    } else if (e.message && e.message.includes('relation "orders" does not exist')) {
      errorMessage = 'Database not initialized. Please contact administrator.';
    } else if (e.message && e.message.includes('connection')) {
      errorMessage = 'Database connection failed. Please try again.';
    }
    
    res.status(500).json({ error: errorMessage });
  }
};
