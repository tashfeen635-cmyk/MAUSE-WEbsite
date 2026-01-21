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

  const { id } = req.query;

  if (!id) {
    jsonResponse(400, { message: 'Project ID is required' });
    return;
  }

  try {
    // Dynamic imports
    let connectDB, Project, jwt;

    try {
      connectDB = require('../../lib/mongodb');
      Project = require('../../lib/models/Project');
      jwt = require('jsonwebtoken');
    } catch (moduleError) {
      console.error('Module loading error:', moduleError);
      jsonResponse(500, {
        message: 'Server configuration error',
        error: 'Failed to load required modules'
      });
      return;
    }

    // Check for MongoDB URI
    if (!process.env.MONGODB_URI) {
      jsonResponse(500, {
        message: 'Server configuration error',
        error: 'Database connection not configured'
      });
      return;
    }

    // Connect to MongoDB
    try {
      await connectDB();
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      jsonResponse(500, {
        message: 'Database connection failed',
        error: 'Unable to connect to database'
      });
      return;
    }

    // Auth helper
    function authenticate() {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        throw new Error('No token provided');
      }
      return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
    }

    // GET single project (public)
    if (req.method === 'GET') {
      try {
        const project = await Project.findById(id);
        if (!project) {
          jsonResponse(404, { message: 'Project not found' });
          return;
        }
        jsonResponse(200, project);
        return;
      } catch (queryError) {
        console.error('Project query error:', queryError);
        jsonResponse(500, {
          message: 'Database query failed',
          error: 'Unable to fetch project'
        });
        return;
      }
    }

    // PUT update project (protected)
    if (req.method === 'PUT') {
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

      try {
        const project = await Project.findById(id);
        if (!project) {
          jsonResponse(404, { message: 'Project not found' });
          return;
        }

        const { title, description, image, category, order } = body || {};

        if (title) project.title = title;
        if (description) project.description = description;
        if (image) project.image = image;
        if (category) project.category = category;
        if (order !== undefined) project.order = order;

        await project.save();
        jsonResponse(200, project);
        return;
      } catch (updateError) {
        console.error('Project update error:', updateError);
        jsonResponse(500, {
          message: 'Failed to update project',
          error: 'Database update failed'
        });
        return;
      }
    }

    // DELETE project (protected)
    if (req.method === 'DELETE') {
      try {
        authenticate();
      } catch (authError) {
        jsonResponse(401, { message: 'Unauthorized' });
        return;
      }

      try {
        const project = await Project.findById(id);
        if (!project) {
          jsonResponse(404, { message: 'Project not found' });
          return;
        }

        await Project.findByIdAndDelete(id);
        jsonResponse(200, { message: 'Project deleted successfully' });
        return;
      } catch (deleteError) {
        console.error('Project delete error:', deleteError);
        jsonResponse(500, {
          message: 'Failed to delete project',
          error: 'Database delete failed'
        });
        return;
      }
    }

    jsonResponse(405, { message: 'Method not allowed' });
  } catch (error) {
    console.error('Project API error:', error);
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
    console.error('TOP LEVEL ERROR:', topLevelError);
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({
        message: 'Internal server error',
        error: 'An unexpected error occurred'
      });
    }
  }
};
