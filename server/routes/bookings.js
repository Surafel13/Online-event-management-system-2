const express = require('express');
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create booking
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('screenshot'), async (req, res) => {
    try {
        const { eventId, ticketCount, userInfo, paymentMethod, transactionId, totalAmount } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.availableSeats < ticketCount) {
            return res.status(400).json({ message: 'Not enough seats available' });
        }

        // Parse and validate amounts
        const parsedTicketCount = parseInt(ticketCount);
        const parsedTotalAmount = parseFloat(totalAmount);

        if (isNaN(parsedTicketCount) || parsedTicketCount <= 0) {
            return res.status(400).json({ message: 'Invalid ticket count' });
        }

        if (isNaN(parsedTotalAmount) || parsedTotalAmount <= 0) {
            return res.status(400).json({ message: 'Invalid total amount' });
        }

        // Parse userInfo
        const parsedUserInfo = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;

        // Generate QR code
        const qrData = JSON.stringify({
            bookingId: new Date().getTime(),
            userId: req.user.id,
            eventId: event._id,
            eventName: event.title,
            date: event.date
        });
        const qrCode = await QRCode.toDataURL(qrData);

        // Create booking with payment pending
        const booking = new Booking({
            userId: req.user.id,
            eventId: event._id,
            userInfo: parsedUserInfo,
            ticketCount: parsedTicketCount,
            totalAmount: parsedTotalAmount,
            eventName: event.title,
            eventDate: event.date,
            eventTime: event.time,
            eventLocation: event.location,
            qrCode,
            status: 'pending_payment',
            payment: {
                method: paymentMethod,
                amount: parsedTotalAmount,
                transactionId,
                screenshotUrl: req.file ? `/uploads/payments/${req.file.filename}` : null,
                status: 'pending',
                submittedAt: new Date()
            }
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get user bookings
router.get('/my-tickets', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id, status: 'confirmed' })
            .populate('eventId')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Cancel booking
router.delete('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Restore available seat
        const event = await Event.findById(booking.eventId);
        if (event) {
            event.availableSeats += 1;
            await event.save();
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get all bookings (admin)
router.get('/admin/all', auth, adminAuth, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'fullName email')
            .populate('eventId')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get booking analytics (admin)
router.get('/admin/analytics', auth, adminAuth, async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments({ status: 'confirmed' });
        const bookingsByEvent = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: '$eventId', count: { $sum: 1 } } },
            { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
            { $unwind: '$event' },
            { $project: { eventName: '$event.title', bookings: '$count' } },
            { $sort: { bookings: -1 } }
        ]);

        res.json({ totalBookings, bookingsByEvent });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Add these routes to your existing bookings router

// Get pending payments (admin)
router.get('/admin/pending-payments', auth, adminAuth, async (req, res) => {
    try {
        const pendingBookings = await Booking.find({
            'payment.status': 'pending',
            status: 'pending_payment'
        }).populate('userId', 'fullName email').sort({ 'payment.submittedAt': -1 });

        res.json(pendingBookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Verify payment (admin)
router.post('/admin/verify-payment/:id', auth, adminAuth, async (req, res) => {
    try {
        const { action, reason } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (action === 'approve') {
            booking.status = 'confirmed';
            booking.payment.status = 'approved';
            booking.payment.approvedBy = req.user.id;
            booking.payment.approvedAt = new Date();

            // Update event available seats
            const event = await Event.findById(booking.eventId);
            if (event) {
                event.availableSeats -= booking.ticketCount;
                await event.save();
            }
        } else if (action === 'reject') {
            booking.status = 'cancelled';
            booking.payment.status = 'rejected';
            booking.payment.rejectionReason = reason;
        }

        await booking.save();
        res.json({ message: `Payment ${action}d successfully` });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get user bookings (updated to include payment status)
router.get('/my-tickets', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('eventId')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Verify ticket by QR code (admin)
router.post('/admin/verify-ticket', auth, adminAuth, async (req, res) => {
    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId).populate('eventId');

        if (!booking) {
            return res.json({ valid: false, message: 'Booking not found' });
        }

        if (booking.status !== 'confirmed') {
            return res.json({ valid: false, message: `Ticket is ${booking.status}` });
        }

        // Check if event date has passed
        const eventDate = new Date(booking.eventDate);
        const today = new Date();
        if (eventDate < today.setHours(0, 0, 0, 0)) {
            return res.json({ valid: false, message: 'Event has already passed' });
        }

        res.json({ valid: true, booking });
    } catch (err) {
        res.json({ valid: false, message: 'Invalid booking ID format' });
    }
});

module.exports = router;
