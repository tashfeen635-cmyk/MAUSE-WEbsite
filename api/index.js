const express = require('express');
const cors = require('cors');
const connectDB = require('../lib/mongodb');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection helper - ensures we only connect once per cold start
let isConnected = false;

const ensureConnection = async () => {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }
};

// Models (import here to ensure they're registered)
require('../lib/models/Admin');
require('../lib/models/Team');
require('../lib/models/Project');

// Auth middleware
const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
        req.adminId = decoded.adminId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// ========== AUTH ROUTES ==========
const Admin = require('../lib/models/Admin');

app.post('/api/auth/login', async (req, res) => {
    try {
        await ensureConnection();
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Ensure admin exists
        const adminUsername = process.env.ADMIN_USERNAME || 'admin@mascorporatess.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'mas123';

        let existingAdmin = await Admin.findOne({ username: adminUsername });
        if (!existingAdmin) {
            const admin = new Admin({ username: adminUsername, password: adminPassword });
            await admin.save();
        }

        const admin = await Admin.findOne({ username: username.trim() });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { adminId: admin._id.toString(), username: admin.username },
            process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: { id: admin._id.toString(), username: admin.username }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/auth/verify', authMiddleware, (req, res) => {
    res.json({ valid: true, adminId: req.adminId });
});

app.put('/api/auth/change-password', authMiddleware, async (req, res) => {
    try {
        await ensureConnection();
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password required' });
        }

        const admin = await Admin.findById(req.adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        admin.password = newPassword;
        await admin.save();
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ========== TEAM ROUTES ==========
const Team = require('../lib/models/Team');

app.get('/api/team', async (req, res) => {
    try {
        await ensureConnection();
        const teamMembers = await Team.find().sort({ order: 1, createdAt: 1 });
        res.json(teamMembers);
    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/team/:id', async (req, res) => {
    try {
        await ensureConnection();
        const teamMember = await Team.findById(req.params.id);
        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        res.json(teamMember);
    } catch (error) {
        console.error('Get team member error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/team', authMiddleware, async (req, res) => {
    try {
        await ensureConnection();
        const { name, position, description, image, social, order } = req.body;

        if (!name || !position || !description || !image) {
            return res.status(400).json({ message: 'Name, position, description, and image are required' });
        }

        const teamMember = new Team({
            name, position, description, image,
            social: social || {},
            order: order || 0
        });

        await teamMember.save();
        res.status(201).json(teamMember);
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/team/:id', authMiddleware, async (req, res) => {
    try {
        await ensureConnection();
        const { name, position, description, image, social, order } = req.body;

        const teamMember = await Team.findById(req.params.id);
        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        if (name) teamMember.name = name;
        if (position) teamMember.position = position;
        if (description) teamMember.description = description;
        if (image) teamMember.image = image;
        if (social) teamMember.social = { ...teamMember.social, ...social };
        if (order !== undefined) teamMember.order = order;

        await teamMember.save();
        res.json(teamMember);
    } catch (error) {
        console.error('Update team error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/team/:id', authMiddleware, async (req, res) => {
    try {
        await ensureConnection();
        const teamMember = await Team.findById(req.params.id);
        if (!teamMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }

        await Team.findByIdAndDelete(req.params.id);
        res.json({ message: 'Team member deleted successfully' });
    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ========== PROJECT ROUTES ==========
const Project = require('../lib/models/Project');

app.get('/api/projects', async (req, res) => {
    try {
        await ensureConnection();
        const projects = await Project.find().sort({ order: 1, createdAt: 1 });
        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
    try {
        await ensureConnection();
        const { title, description, image, category, order } = req.body;

        if (!title || !description || !image) {
            return res.status(400).json({ message: 'Title, description, and image are required' });
        }

        const project = new Project({
            title, description, image,
            category: category || 'other',
            order: order || 0
        });

        await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ========== GALLERY ROUTES ==========
const Gallery = require('../lib/models/Gallery');

app.get('/api/gallery', async (req, res) => {
    try {
        await ensureConnection();
        const galleryItems = await Gallery.find().sort({ order: 1, createdAt: -1 });
        res.json(galleryItems);
    } catch (error) {
        console.error('Get gallery error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/gallery', authMiddleware, async (req, res) => {
    try {
        await ensureConnection();
        const { title, description, image, order } = req.body;

        if (!image) {
            return res.status(400).json({ message: 'Image is required' });
        }

        const galleryItem = new Gallery({
            title: title || '',
            description: description || '',
            image,
            order: order || 0
        });

        await galleryItem.save();
        res.status(201).json(galleryItem);
    } catch (error) {
        console.error('Create gallery error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/gallery/:id', authMiddleware, async (req, res) => {
    try {
        await ensureConnection();
        const galleryItem = await Gallery.findById(req.params.id);
        if (!galleryItem) {
            return res.status(404).json({ message: 'Gallery item not found' });
        }

        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ message: 'Gallery item deleted successfully' });
    } catch (error) {
        console.error('Delete gallery error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Gallery image upload (using base64 for Vercel compatibility)
app.post('/api/upload/gallery', authMiddleware, async (req, res) => {
    try {
        const { image, filename } = req.body;

        if (!image) {
            return res.status(400).json({ message: 'Image data is required' });
        }

        // For Vercel, we store base64 images directly or use external storage
        // Return the base64 data URL directly for now
        res.json({
            path: image,
            filename: filename || 'gallery-image',
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        console.error('Upload gallery error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// ========== TEST/DEBUG ROUTES ==========
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working',
        timestamp: new Date().toISOString(),
        env: {
            hasMongoURI: !!process.env.MONGODB_URI,
            hasJWTSecret: !!process.env.JWT_SECRET
        }
    });
});

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// Export for Vercel serverless
module.exports = app;
