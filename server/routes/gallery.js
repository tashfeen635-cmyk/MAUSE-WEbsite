const express = require('express');
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all gallery items (public)
router.get('/', async (req, res) => {
    try {
        const galleryItems = await Gallery.find().sort({ order: 1, createdAt: -1 });
        res.json(galleryItems);
    } catch (error) {
        console.error('Get gallery error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create gallery item (protected)
router.post('/', auth, async (req, res) => {
    try {
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

// Delete gallery item (protected)
router.delete('/:id', auth, async (req, res) => {
    try {
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

module.exports = router;
