const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    organizer: { type: String, required: true },
    capacity: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    price: { type: Number, required: true, default: 49 },
    imageUrl: { type: String },
    isVisible: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
