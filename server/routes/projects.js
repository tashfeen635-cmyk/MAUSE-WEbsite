const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all projects (public)
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ order: 1, createdAt: 1 });
        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create project (protected)
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, image, category, order } = req.body;

        if (!title || !description || !image) {
            return res.status(400).json({ message: 'Title, description, and image are required' });
        }

        const project = new Project({
            title,
            description,
            image,
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

module.exports = router;
