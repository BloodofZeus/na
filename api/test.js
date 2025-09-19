// Simple test API for Vercel
module.exports = (req, res) => {
  res.json({
    ok: true,
    message: 'Vercel API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};
