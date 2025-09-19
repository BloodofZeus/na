// Simple test function for Vercel
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Vercel API is working!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: req.headers
  });
};
