import { useState, useEffect } from 'react';
import api from '../api/axios';

function MyTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/bookings/my-tickets');
            // Sort to show pending first
            const sortedTickets = data.sort((a, b) => {
                if (a.status === 'pending_payment' && b.status !== 'pending_payment') return -1;
                if (a.status !== 'pending_payment' && b.status === 'pending_payment') return 1;
                return new Date(b.bookingDate) - new Date(a.bookingDate);
            });
            setTickets(sortedTickets);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-green-500';
            case 'pending_payment': return 'bg-yellow-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'confirmed': return '✓ Confirmed';
            case 'pending_payment': return '⏳ Pending Payment';
            case 'cancelled': return '✗ Cancelled';
            default: return status;
        }
    };

    const downloadQR = (qrCode, eventName) => {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `ticket-${eventName.replace(/\s+/g, '-')}.png`;
        link.click();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
                    <p className="mt-6 text-gray-600">Loading your tickets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        🎫 My Tickets
                    </h1>
                    <p className="text-gray-600 text-lg">View and manage your event tickets</p>
                </div>

                {tickets.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
                        <div className="text-7xl mb-6">🎟️</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Tickets Yet</h3>
                        <p className="text-gray-600 mb-6">You haven't booked any events yet</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                        >
                            Explore Events
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {tickets.map(ticket => (
                            <div key={ticket._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                                <div className="relative">
                                    {/* Status Badge */}
                                    <div className={`absolute top-4 right-4 ${getStatusColor(ticket.status)} text-white px-4 py-2 rounded-full text-sm font-semibold z-10 shadow-lg`}>
                                        {getStatusText(ticket.status)}
                                    </div>

                                    <div className="md:flex">
                                        {/* Ticket Info */}
                                        <div className="flex-1 p-8">
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{ticket.eventName}</h3>
                                            <p className="text-purple-600 mb-4">
                                                {ticket.ticketCount} {ticket.ticketCount === 1 ? 'Ticket' : 'Tickets'} • Total: ${ticket.totalAmount}
                                            </p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl">👤</div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Ticket Holder</p>
                                                        <p className="font-semibold text-gray-800">{ticket.userInfo?.fullName}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl">📧</div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Email</p>
                                                        <p className="font-semibold text-gray-800">{ticket.userInfo?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl">📞</div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Phone</p>
                                                        <p className="font-semibold text-gray-800">{ticket.userInfo?.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl">📅</div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Event Date</p>
                                                        <p className="font-semibold text-gray-800">
                                                            {new Date(ticket.eventDate).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {ticket.status === 'confirmed' && (
                                                <button
                                                    onClick={() => downloadQR(ticket.qrCode, ticket.eventName)}
                                                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Download QR Code
                                                </button>
                                            )}

                                            {ticket.status === 'pending_payment' && (
                                                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="text-2xl">⏳</div>
                                                        <div>
                                                            <p className="font-semibold text-yellow-900 mb-1">Pending Approval</p>
                                                            <p className="text-yellow-800 text-sm">
                                                                Your payment is being verified by our admin team. You will receive your QR code ticket once approved.
                                                            </p>
                                                            <p className="text-yellow-700 text-xs mt-2">
                                                                Submitted: {new Date(ticket.payment?.submittedAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {ticket.status === 'cancelled' && ticket.payment?.rejectionReason && (
                                                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="text-2xl">❌</div>
                                                        <div>
                                                            <p className="font-semibold text-red-900 mb-1">Payment Rejected</p>
                                                            <p className="text-red-800 text-sm">
                                                                Reason: {ticket.payment.rejectionReason}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* QR Code Section */}
                                        {ticket.status === 'confirmed' && (
                                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex flex-col items-center justify-center md:w-80">
                                                <img
                                                    src={ticket.qrCode}
                                                    alt="QR Code"
                                                    className="w-48 h-48 rounded-xl shadow-lg mb-4"
                                                />
                                                <p className="text-sm text-gray-600 text-center">Scan this QR code at the venue entrance</p>
                                                <div className="mt-3 text-center">
                                                    <p className="text-xs text-gray-500">Booking ID: {ticket._id.slice(-8)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyTickets;