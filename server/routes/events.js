const express = require('express');
const Event = require('../models/Event');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all visible events (public)
router.get('/', async (req, res) => {
    try {
        const { category, search, sort } = req.query;
        let query = { isVisible: true };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = {};
        if (sort === 'date') sortOption = { date: 1 };
        else if (sort === 'popular') sortOption = { availableSeats: -1 };
        else sortOption = { createdAt: -1 };

        const events = await Event.find(query).sort(sortOption);
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Create event (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
    try {
        const { title, description, category, date, time, location, organizer, capacity, imageUrl } = req.body;

        const event = new Event({
            title,
            description,
            category,
            date,
            time,
            location,
            organizer,
            capacity,
            availableSeats: capacity,
            imageUrl
        });

        await event.save();
        res.status(201).json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update event (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Delete event (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get all events for admin
router.get('/admin/all', auth, adminAuth, async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
