import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

function EventDetails({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [ticketCount, setTicketCount] = useState(1);
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        emergencyContact: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [screenshot, setScreenshot] = useState(null);
    const [transactionId, setTransactionId] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchEvent();
        if (user) {
            setUserInfo({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                emergencyContact: ''
            });
        }
    }, [id, user]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/events/${id}`);
            setEvent(data);
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Failed to load event', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleBookingClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setShowPaymentModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ text: 'File too large (max 5MB)', type: 'error' });
                return;
            }
            if (!file.type.startsWith('image/')) {
                setMessage({ text: 'Please upload an image file', type: 'error' });
                return;
            }
            setScreenshot(file);
        }
    };

    const handleSubmitBooking = async (e) => {
        e.preventDefault();

        if (!transactionId) {
            setMessage({ text: 'Please enter transaction ID', type: 'error' });
            return;
        }

        if (!screenshot) {
            setMessage({ text: 'Please upload payment screenshot', type: 'error' });
            return;
        }

        setSubmitting(true);
        const totalAmount = (event.price || 0) * ticketCount;
        const formData = new FormData();
        formData.append('eventId', id);
        formData.append('ticketCount', ticketCount);
        formData.append('userInfo', JSON.stringify(userInfo));
        formData.append('paymentMethod', paymentMethod);
        formData.append('transactionId', transactionId);
        formData.append('screenshot', screenshot);
        formData.append('totalAmount', totalAmount.toString());

        try {
            const { data } = await api.post('/bookings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ text: 'Booking submitted! Waiting for payment confirmation.', type: 'success' });
            setTimeout(() => {
                setShowPaymentModal(false);
                navigate('/my-tickets');
            }, 2000);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Booking failed', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
                    <p className="mt-6 text-gray-600 text-lg">Loading amazing event...</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😢</div>
                    <p className="text-xl text-gray-600">Event not found</p>
                    <button onClick={() => navigate('/')} className="mt-4 text-purple-600 hover:underline">
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Events
                </button>

                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                    {/* Hero Image */}
                    <div className="relative h-96 overflow-hidden">
                        {event.imageUrl ? (
                            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 flex items-center justify-center">
                                <div className="text-center text-white">
                                    <div className="text-8xl mb-4 animate-bounce">🎉</div>
                                    <h2 className="text-4xl font-bold">{event.category}</h2>
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-3">
                                <span className="text-2xl">
                                    {event.category === 'Technology' && '💻'}
                                    {event.category === 'Music' && '🎵'}
                                    {event.category === 'Business' && '💼'}
                                    {event.category === 'Food & Drink' && '🍷'}
                                    {event.category === 'Art' && '🎨'}
                                    {event.category === 'Health & Wellness' && '🧘'}
                                </span>
                                <span className="font-semibold">{event.category}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">{event.title}</h1>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Event</h2>
                                    <p className="text-gray-600 leading-relaxed">{event.description}</p>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Event Details</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">📅</div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Date & Time</p>
                                                <p className="text-gray-600">
                                                    {new Date(event.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                    <br />at {event.time}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">📍</div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Location</p>
                                                <p className="text-gray-600">{event.location}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="text-2xl">👤</div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Organizer</p>
                                                <p className="text-gray-600">{event.organizer}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Card */}
                            <div className="lg:col-span-1">
                                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white sticky top-24">
                                    <h3 className="text-2xl font-bold mb-4">Get Your Ticket</h3>
                                    <div className="mb-6">
                                        <p className="text-sm opacity-90">Price per ticket</p>
                                        <p className="text-4xl font-bold">${event.price || 49}<span className="text-lg">.99</span></p>
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-sm mb-2">Number of Tickets</label>
                                        <select
                                            value={ticketCount}
                                            onChange={(e) => setTicketCount(parseInt(e.target.value))}
                                            className="w-full px-4 py-2 rounded-lg text-gray-800 bg-white"
                                            disabled={event.availableSeats === 0}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <option key={num} value={num} disabled={num > event.availableSeats}>
                                                    {num} {num === 1 ? 'ticket' : 'tickets'} - ${(event.price || 49) * num}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-6">
                                        <div className="flex justify-between py-2 border-t border-white/20">
                                            <span>Subtotal</span>
                                            <span className="font-bold">${((event.price || 49) * ticketCount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-t border-white/20">
                                            <span>Service Fee</span>
                                            <span>$0.00</span>
                                        </div>
                                        <div className="flex justify-between py-2 font-bold text-lg border-t border-white/20">
                                            <span>Total</span>
                                            <span>${((event.price || 49) * ticketCount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleBookingClick}
                                        disabled={event.availableSeats === 0}
                                        className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${event.availableSeats === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-yellow-400 text-purple-900 hover:bg-yellow-300 transform hover:scale-105'
                                            }`}
                                    >
                                        {event.availableSeats === 0 ? 'Sold Out' : 'Book Now →'}
                                    </button>
                                    <p className="text-xs text-center mt-4 opacity-75">
                                        {event.availableSeats} seats available
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">Complete Your Booking</h2>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitBooking} className="p-6 space-y-6">
                            {message.text && (
                                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            {/* User Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={userInfo.fullName}
                                            onChange={(e) => setUserInfo({ ...userInfo, fullName: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={userInfo.email}
                                            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={userInfo.phone}
                                            onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                                        <input
                                            type="tel"
                                            value={userInfo.emergencyContact}
                                            onChange={(e) => setUserInfo({ ...userInfo, emergencyContact: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                        <input
                                            type="text"
                                            value={userInfo.address}
                                            onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('bank_transfer')}
                                        className={`p-4 border-2 rounded-xl text-center transition-all ${paymentMethod === 'bank_transfer'
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">🏦</div>
                                        <p className="font-semibold">Bank Transfer</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('mobile_money')}
                                        className={`p-4 border-2 rounded-xl text-center transition-all ${paymentMethod === 'mobile_money'
                                            ? 'border-purple-500 bg-purple-50'
                                            : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">📱</div>
                                        <p className="font-semibold">Mobile Money</p>
                                    </button>
                                </div>

                                {/* Bank Details */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Bank Account Details:</p>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Bank:</span> Example Bank</p>
                                        <p><span className="font-medium">Account Name:</span> Event Management Inc.</p>
                                        <p><span className="font-medium">Account Number:</span> 1234567890</p>
                                        <p><span className="font-medium">Reference:</span> Your Email + Event Name</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter your transaction/reference ID"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Screenshot/Proof *</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="screenshot"
                                            required
                                        />
                                        <label htmlFor="screenshot" className="cursor-pointer">
                                            <div className="text-4xl mb-2">📸</div>
                                            <p className="text-gray-600">Click to upload payment screenshot</p>
                                            <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                                        </label>
                                        {screenshot && (
                                            <div className="mt-4">
                                                <p className="text-green-600">✓ {screenshot.name}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Processing...' : `Confirm Booking - $${((event.price || 49) * ticketCount).toFixed(2)}`}
                                </button>
                                <p className="text-xs text-center text-gray-500 mt-3">
                                    Your booking will be confirmed after payment verification
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EventDetails;