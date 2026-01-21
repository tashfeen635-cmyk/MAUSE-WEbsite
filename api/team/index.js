// Top-level error handler wrapper
async function handler(req, res) {
  // Wrapper to ensure JSON responses
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

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Dynamic imports to catch module loading errors
    let connectDB, Team, jwt;
    
    try {
      connectDB = require('../../lib/mongodb');
      Team = require('../../lib/models/Team');
      jwt = require('jsonwebtoken');
    } catch (moduleError) {
      console.error('Module loading error:', moduleError);
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
        error: 'Database connection not configured'
      });
      return;
    }

    // Connect to MongoDB
    try {
      await connectDB();
      console.log('MongoDB connected successfully for team API');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      jsonResponse(500, { 
        message: 'Database connection failed',
        error: 'Unable to connect to database',
        details: dbError.message
      });
      return;
    }

    // GET all team members (public)
    if (req.method === 'GET') {
      try {
        const teamMembers = await Team.find().sort({ order: 1, createdAt: 1 });
        jsonResponse(200, teamMembers);
        return;
      } catch (queryError) {
        console.error('Team query error:', queryError);
        jsonResponse(500, { 
          message: 'Database query failed',
          error: 'Unable to fetch team members',
          details: queryError.message
        });
        return;
      }
    }

    // POST create team member (protected)
    if (req.method === 'POST') {
      // Auth helper
      function authenticate() {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          throw new Error('No token provided');
        }
        return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
      }

      try {
        authenticate();
      } catch (authError) {
        jsonResponse(401, { message: 'Unauthorized' });
        return;
      }

      // Parse request body
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          jsonResponse(400, { message: 'Invalid JSON in request body' });
          return;
        }
      }

      const { name, position, description, image, social, order } = body || {};

      if (!name || !position || !description || !image) {
        jsonResponse(400, { message: 'Name, position, description, and image are required' });
        return;
      }

      try {
        const teamMember = new Team({
          name,
          position,
          description,
          image,
          social: social || {},
          order: order || 0
        });

        await teamMember.save();
        jsonResponse(201, teamMember);
        return;
      } catch (saveError) {
        console.error('Team save error:', saveError);
        jsonResponse(500, { 
          message: 'Failed to create team member',
          error: 'Database save failed',
          details: saveError.message
        });
        return;
      }
    }

    jsonResponse(405, { message: 'Method not allowed' });
  } catch (error) {
    console.error('Team API error:', error);
    console.error('Error stack:', error.stack);
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
    // Final safety net
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
