const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    method: { type: String, enum: ['bank_transfer', 'mobile_money', 'card'], required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true },
    screenshotUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectionReason: String,
    submittedAt: { type: Date, default: Date.now }
});

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },

    // User Information
    userInfo: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String },
        emergencyContact: { type: String }
    },

    // Ticket Information
    ticketCount: { type: Number, required: true, default: 1 },
    totalAmount: { type: Number, required: true },

    // Event Details (denormalized for easy access)
    eventName: { type: String, required: true },
    eventDate: { type: Date, required: true },
    eventTime: { type: String, required: true },
    eventLocation: { type: String, required: true },

    // Payment
    payment: paymentSchema,

    // QR Code
    qrCode: { type: String, required: true },

    bookingDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending_payment', 'confirmed', 'cancelled', 'expired'], default: 'pending_payment' }
});

module.exports = mongoose.model('Booking', bookingSchema);