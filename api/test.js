// Simple test endpoint to verify API is working
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.status(200).json({
    message: 'API is working',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    env: {
      hasMongoURI: !!process.env.MONGODB_URI,
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasAdminUsername: !!process.env.ADMIN_USERNAME,
      hasAdminPassword: !!process.env.ADMIN_PASSWORD
    }
  });
};
