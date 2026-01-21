// Top-level error handler wrapper
async function handler(req, res) {
  // Wrapper to ensure JSON responses even on unhandled errors
  function jsonResponse(statusCode, data) {
    if (res.headersSent) return;
    res.setHeader('Content-Type', 'application/json');
    res.status(statusCode).json(data);
  }

  // Set headers first
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle non-POST requests
  if (req.method !== 'POST') {
    jsonResponse(405, { message: 'Method not allowed' });
    return;
  }

  try {
    // Dynamic imports to catch module loading errors
    let connectDB, Admin, jwt;
    
    try {
      connectDB = require('../../lib/mongodb');
      Admin = require('../../lib/models/Admin');
      jwt = require('jsonwebtoken');
    } catch (moduleError) {
      console.error('Module loading error:', moduleError);
      console.error('Module error stack:', moduleError.stack);
      jsonResponse(500, { 
        message: 'Server configuration error',
        error: 'Failed to load required modules',
        details: moduleError.message
      });
      return;
    }

    // Check for MongoDB URI
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI environment variable is not set');
      jsonResponse(500, { 
        message: 'Server configuration error',
        error: 'Database connection not configured. Please set MONGODB_URI environment variable.'
      });
      return;
    }

    // Parse request body
    let body = req.body;
    if (!body || (typeof body === 'string' && body.trim() === '')) {
      jsonResponse(400, { message: 'Request body is required' });
      return;
    }

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        jsonResponse(400, { message: 'Invalid JSON in request body' });
        return;
      }
    }

    const { username, password } = body || {};

    if (!username || !password) {
      jsonResponse(400, { message: 'Username and password are required' });
      return;
    }

    // Connect to MongoDB
    try {
      await connectDB();
      console.log('MongoDB connected successfully');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      console.error('MongoDB error stack:', dbError.stack);
      jsonResponse(500, { 
        message: 'Database connection failed',
        error: 'Unable to connect to database',
        details: dbError.message
      });
      return;
    }

    // Ensure admin user exists
    try {
      const adminUsername = process.env.ADMIN_USERNAME || 'tashu';
      const adminPassword = process.env.ADMIN_PASSWORD || 'tashu123';

      const existingAdmin = await Admin.findOne({ username: adminUsername });
      if (!existingAdmin) {
        const admin = new Admin({
          username: adminUsername,
          password: adminPassword
        });
        await admin.save();
        console.log('Admin user created:', adminUsername);
      }
    } catch (adminInitError) {
      console.error('Admin initialization error:', adminInitError);
      // Continue - might already exist
    }

    // Find admin
    let admin;
    try {
      admin = await Admin.findOne({ username: username.trim() });
    } catch (findError) {
      console.error('Admin find error:', findError);
      console.error('Find error stack:', findError.stack);
      jsonResponse(500, { 
        message: 'Database query failed',
        error: 'Unable to query database',
        details: findError.message
      });
      return;
    }

    if (!admin) {
      jsonResponse(401, { message: 'Invalid username or password' });
      return;
    }

    // Check password
    let isMatch;
    try {
      isMatch = await admin.comparePassword(password);
    } catch (passwordError) {
      console.error('Password comparison error:', passwordError);
      console.error('Password error stack:', passwordError.stack);
      jsonResponse(500, { 
        message: 'Authentication error',
        error: 'Unable to verify password',
        details: passwordError.message
      });
      return;
    }

    if (!isMatch) {
      jsonResponse(401, { message: 'Invalid username or password' });
      return;
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
    
    let token;
    try {
      token = jwt.sign(
        { adminId: admin._id.toString(), username: admin.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
    } catch (tokenError) {
      console.error('JWT sign error:', tokenError);
      console.error('Token error stack:', tokenError.stack);
      jsonResponse(500, { 
        message: 'Token generation failed',
        error: 'Unable to generate authentication token',
        details: tokenError.message
      });
      return;
    }

    // Success response
    jsonResponse(200, {
      token,
      admin: {
        id: admin._id.toString(),
        username: admin.username
      }
    });

  } catch (error) {
    // Catch any unhandled errors
    console.error('Unexpected login error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Always return JSON, never plain text
    jsonResponse(500, { 
      message: 'Server error',
      error: 'An unexpected error occurred',
      details: error.message
    });
  }
}

// Export with error handling wrapper
module.exports = async (req, res) => {
  try {
    await handler(req, res);
  } catch (topLevelError) {
    // Final safety net - catch absolutely everything
    console.error('TOP LEVEL ERROR:', topLevelError);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({
        message: 'Internal server error',
        error: 'An unexpected error occurred',
        type: topLevelError.name || 'UnknownError'
      });
    }
  }
};
