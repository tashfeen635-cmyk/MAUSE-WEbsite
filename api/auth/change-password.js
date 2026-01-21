const connectDB = require('../../lib/mongodb');
const Admin = require('../../lib/models/Admin');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    // Parse request body if needed
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        res.status(400).json({ message: 'Invalid JSON in request body' });
        return;
      }
    }

    await connectDB();

    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ message: 'No token provided, authorization denied' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Current password and new password are required' });
      return;
    }

    if (newPassword.length < 4) {
      res.status(400).json({ message: 'New password must be at least 4 characters' });
      return;
    }

    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      res.status(404).json({ message: 'Admin not found' });
      return;
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Token is not valid' });
      return;
    }
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};
