import { useState, useEffect } from 'react';
import api from '../api/axios';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [formData, setFormData] = useState({
        title: '', description: '', category: 'Technology', date: '', time: '',
        location: '', organizer: '', capacity: '', price: 49.99, imageUrl: ''
    });
    const [userFormData, setUserFormData] = useState({
        fullName: '', email: '', password: '', role: 'user'
    });
    const [editingId, setEditingId] = useState(null);
    const [editingUserId, setEditingUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [scannedTicket, setScannedTicket] = useState(null);
    const [scanInput, setScanInput] = useState('');

    useEffect(() => {
        if (activeTab === 'payments') fetchPendingPayments();
        if (activeTab === 'events') fetchEvents();
        if (activeTab === 'dashboard') {
            fetchAnalytics();
            fetchEvents();
            fetchPendingPayments();
        }
        if (activeTab === 'bookings') fetchBookings();
        if (activeTab === 'users') fetchUsers();
    }, [activeTab]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/events/admin/all');
            setEvents(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/bookings/admin/all');
            setBookings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/auth/admin/users');
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingPayments = async () => {
        try {
            const { data } = await api.get('/bookings/admin/pending-payments');
            setPendingPayments(data);
        } catch (err) {
            console.error(err);
        }
    };

    const verifyPayment = async (bookingId, action, reason = '') => {
        try {
            await api.post(`/bookings/admin/verify-payment/${bookingId}`, { action, reason });
            fetchPendingPayments();
            fetchAnalytics();
            alert(`Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        } catch (err) {
            alert('Failed to process payment');
        }
    };

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/bookings/admin/analytics');
            setAnalytics(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/events/${editingId}`, formData);
                setEditingId(null);
            } else {
                await api.post('/events', formData);
            }
            setFormData({
                title: '', description: '', category: 'Technology', date: '', time: '',
                location: '', organizer: '', capacity: '', price: 49.99, imageUrl: ''
            });
            setActiveTab('events');
            fetchEvents();
        } catch (err) {
            alert('Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingUserId) {
                await api.put(`/auth/admin/users/${editingUserId}`, userFormData);
                setEditingUserId(null);
            } else {
                await api.post('/auth/admin/users', userFormData);
            }
            setUserFormData({ fullName: '', email: '', password: '', role: 'user' });
            fetchUsers();
            alert('User saved successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to save user');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (event) => {
        setFormData({
            title: event.title,
            description: event.description,
            category: event.category,
            date: event.date.split('T')[0],
            time: event.time,
            location: event.location,
            organizer: event.organizer,
            capacity: event.capacity,
            price: event.price || 49.99,
            imageUrl: event.imageUrl || ''
        });
        setEditingId(event._id);
        setActiveTab('create');
    };

    const handleEditUser = (user) => {
        setUserFormData({
            fullName: user.fullName,
            email: user.email,
            password: '',
            role: user.role
        });
        setEditingUserId(user._id);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this event?')) return;
        try {
            await api.delete(`/events/${id}`);
            fetchEvents();
        } catch (err) {
            alert('Failed to delete event');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Delete this user?')) return;
        try {
            await api.delete(`/auth/admin/users/${id}`);
            fetchUsers();
            alert('User deleted successfully!');
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleScanQR = async () => {
        if (!scanInput.trim()) {
            alert('Please enter booking ID');
            return;
        }
        try {
            const { data } = await api.post('/bookings/admin/verify-ticket', { bookingId: scanInput });
            setScannedTicket(data);
        } catch (err) {
            alert(err.response?.data?.message || 'Invalid ticket');
            setScannedTicket(null);
        }
    };

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBookings = bookings.filter(booking =>
        booking.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryIcon = (cat) => {
        const icons = {
            'Technology': '💻',
            'Music': '🎵',
            'Business': '💼',
            'Food & Drink': '🍷',
            'Art': '🎨',
            'Health & Wellness': '🧘',
            'Entertainment': '🎬',
            'Charity': '🤝'
        };
        return icons[cat] || '🎉';
    };

    const getStatusBadge = (status) => {
        const badges = {
            'confirmed': 'bg-green-100 text-green-800',
            'pending_payment': 'bg-yellow-100 text-yellow-800',
            'cancelled': 'bg-red-100 text-red-800',
            'expired': 'bg-gray-100 text-gray-800'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm mb-6">
                        <span className="text-4xl">⚙️</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Admin Dashboard
                        </span>
                    </div>
                    <p className="text-gray-600 text-lg">Manage events, track bookings, and control the platform</p>
                </div>

                {/* Tabs */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2 mb-8 overflow-x-auto">
                    <div className="flex flex-wrap gap-2 min-w-max">
                        {[
                            { id: 'dashboard', label: '📊 Dashboard', color: 'purple' },
                            { id: 'events', label: '📋 Events', color: 'blue' },
                            { id: 'create', label: editingId ? '✏️ Edit Event' : '➕ Create Event', color: 'green' },
                            { id: 'bookings', label: '🎫 All Bookings', color: 'indigo' },
                            { id: 'payments', label: '💳 Payments', color: 'yellow' },
                            { id: 'scanner', label: '📱 QR Scanner', color: 'teal' },
                            { id: 'users', label: '👥 Users', color: 'pink' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

                    {/* Dashboard Tab */}
                    {activeTab === 'dashboard' && (
                        <div className="p-8">
                            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                📊 Dashboard Overview
                            </h2>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                                    <div className="text-4xl mb-2">🎉</div>
                                    <div className="text-3xl font-bold">{events.length}</div>
                                    <div className="text-blue-100">Total Events</div>
                                </div>
                                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                                    <div className="text-4xl mb-2">🎫</div>
                                    <div className="text-3xl font-bold">{analytics?.totalBookings || 0}</div>
                                    <div className="text-green-100">Confirmed Bookings</div>
                                </div>
                                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
                                    <div className="text-4xl mb-2">⏳</div>
                                    <div className="text-3xl font-bold">{pendingPayments.length}</div>
                                    <div className="text-yellow-100">Pending Payments</div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                                    <div className="text-4xl mb-2">👥</div>
                                    <div className="text-3xl font-bold">{users.length}</div>
                                    <div className="text-purple-100">Total Users</div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <span>⏰</span> Pending Payments
                                    </h3>
                                    {pendingPayments.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No pending payments</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {pendingPayments.slice(0, 5).map(payment => (
                                                <div key={payment._id} className="bg-white rounded-lg p-4 shadow-sm">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold">{payment.eventName}</p>
                                                            <p className="text-sm text-gray-600">{payment.userId?.fullName}</p>
                                                        </div>
                                                        <span className="text-purple-600 font-bold">${payment.totalAmount}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <span>🔥</span> Popular Events
                                    </h3>
                                    {events.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No events yet</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {events.slice(0, 5).map(event => (
                                                <div key={event._id} className="bg-white rounded-lg p-4 shadow-sm">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold">{event.title}</p>
                                                            <p className="text-sm text-gray-600">{event.category}</p>
                                                        </div>
                                                        <span className="text-green-600 font-bold">{event.availableSeats} seats</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Events Tab */}
                    {activeTab === 'events' && (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    📋 All Events
                                </h2>
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredEvents.map(event => (
                                        <div key={event._id} className="bg-white border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                                            <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                                <span className="text-6xl">{getCategoryIcon(event.category)}</span>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                                    <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                                                    <p>📍 {event.location}</p>
                                                    <p>🎫 {event.availableSeats} / {event.capacity} seats</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(event)}
                                                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(event._id)}
                                                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Create/Edit Event Tab */}
                    {activeTab === 'create' && (
                        <div className="p-8">
                            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {editingId ? '✏️ Edit Event' : '➕ Create New Event'}
                            </h2>
                            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Event Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        >
                                            <option value="Technology">💻 Technology</option>
                                            <option value="Music">🎵 Music</option>
                                            <option value="Business">💼 Business</option>
                                            <option value="Food & Drink">🍷 Food & Drink</option>
                                            <option value="Art">🎨 Art</option>
                                            <option value="Health & Wellness">🧘 Health & Wellness</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Description</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Location</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Organizer</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.organizer}
                                            onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Capacity</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Image URL (optional)</label>
                                    <input
                                        type="url"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : editingId ? 'Update Event' : 'Create Event'}
                                    </button>
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingId(null);
                                                setFormData({
                                                    title: '', description: '', category: 'Technology', date: '', time: '',
                                                    location: '', organizer: '', capacity: '', price: 49.99, imageUrl: ''
                                                });
                                            }}
                                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* All Bookings Tab */}
                    {activeTab === 'bookings' && (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    🎫 All Bookings
                                </h2>
                                <input
                                    type="text"
                                    placeholder="Search bookings..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tickets</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredBookings.map(booking => (
                                                <tr key={booking._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                                                        {booking._id.slice(-8)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{booking.eventName}</div>
                                                        <div className="text-sm text-gray-500">{new Date(booking.eventDate).toLocaleDateString()}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{booking.userInfo?.fullName}</div>
                                                        <div className="text-sm text-gray-500">{booking.userInfo?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {booking.ticketCount}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                        ${booking.totalAmount}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(booking.status)}`}>
                                                            {booking.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(booking.bookingDate).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredBookings.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            No bookings found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payments Tab */}
                    {activeTab === 'payments' && (
                        <div className="p-8">
                            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                💳 Pending Payments
                            </h2>

                            {pendingPayments.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">✅</div>
                                    <p className="text-xl text-gray-600">No pending payments</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {pendingPayments.map(payment => (
                                        <div key={payment._id} className="bg-white border rounded-2xl overflow-hidden shadow-lg">
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold">{payment.eventName}</h3>
                                                        <p className="text-gray-600">{payment.userId?.fullName} ({payment.userId?.email})</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-purple-600">${payment.totalAmount}</div>
                                                        <div className="text-sm text-gray-500">{payment.ticketCount} tickets</div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Payment Method</p>
                                                        <p className="font-semibold">{payment.payment?.method}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Transaction ID</p>
                                                        <p className="font-semibold">{payment.payment?.transactionId}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Submitted</p>
                                                        <p className="font-semibold">{new Date(payment.payment?.submittedAt).toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Contact</p>
                                                        <p className="font-semibold">{payment.userInfo?.phone}</p>
                                                    </div>
                                                </div>

                                                {payment.payment?.screenshotUrl && (
                                                    <div className="mb-4">
                                                        <p className="text-sm text-gray-500 mb-2">Payment Screenshot:</p>
                                                        <img
                                                            src={`http://localhost:5000${payment.payment.screenshotUrl}`}
                                                            alt="Payment proof"
                                                            className="max-w-md rounded-lg border cursor-pointer hover:shadow-lg transition-shadow"
                                                            onClick={() => {
                                                                setSelectedImage(`http://localhost:5000${payment.payment.screenshotUrl}`);
                                                                setShowModal(true);
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => verifyPayment(payment._id, 'approve')}
                                                        className="flex-1 bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                                                    >
                                                        ✓ Approve Payment
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const reason = prompt('Enter rejection reason:');
                                                            if (reason) verifyPayment(payment._id, 'reject', reason);
                                                        }}
                                                        className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                                                    >
                                                        ✗ Reject Payment
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* QR Scanner Tab */}
                    {activeTab === 'scanner' && (
                        <div className="p-8">
                            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                📱 QR Code Scanner
                            </h2>

                            <div className="max-w-2xl mx-auto">
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 mb-6">
                                    <div className="text-center mb-6">
                                        <div className="text-6xl mb-4">📱</div>
                                        <p className="text-gray-600">Enter the booking ID from the QR code to verify the ticket</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder="Enter Booking ID..."
                                            value={scanInput}
                                            onChange={(e) => setScanInput(e.target.value)}
                                            className="flex-1 px-6 py-4 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-lg"
                                            onKeyPress={(e) => e.key === 'Enter' && handleScanQR()}
                                        />
                                        <button
                                            onClick={handleScanQR}
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                                        >
                                            Verify
                                        </button>
                                    </div>
                                </div>

                                {scannedTicket && (
                                    <div className={`rounded-2xl p-8 ${scannedTicket.valid ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'}`}>
                                        <div className="text-center mb-6">
                                            <div className="text-6xl mb-4">{scannedTicket.valid ? '✅' : '❌'}</div>
                                            <h3 className={`text-2xl font-bold ${scannedTicket.valid ? 'text-green-800' : 'text-red-800'}`}>
                                                {scannedTicket.valid ? 'Valid Ticket' : 'Invalid Ticket'}
                                            </h3>
                                        </div>

                                        {scannedTicket.valid && (
                                            <div className="space-y-3">
                                                <div className="bg-white rounded-lg p-4">
                                                    <p className="text-sm text-gray-500">Event</p>
                                                    <p className="font-bold text-lg">{scannedTicket.booking.eventName}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white rounded-lg p-4">
                                                        <p className="text-sm text-gray-500">Ticket Holder</p>
                                                        <p className="font-semibold">{scannedTicket.booking.userInfo?.fullName}</p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-4">
                                                        <p className="text-sm text-gray-500">Tickets</p>
                                                        <p className="font-semibold">{scannedTicket.booking.ticketCount}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-white rounded-lg p-4">
                                                    <p className="text-sm text-gray-500">Booking ID</p>
                                                    <p className="font-mono text-sm">{scannedTicket.booking._id}</p>
                                                </div>
                                            </div>
                                        )}

                                        {!scannedTicket.valid && (
                                            <div className="bg-white rounded-lg p-4">
                                                <p className="text-red-800 font-semibold">{scannedTicket.message}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    👥 User Management
                                </h2>
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>

                            {/* Add User Form */}
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
                                <h3 className="text-xl font-bold mb-4">{editingUserId ? '✏️ Edit User' : '➕ Add New User'}</h3>
                                <form onSubmit={handleUserSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        required
                                        value={userFormData.fullName}
                                        onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                                        className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        required
                                        value={userFormData.email}
                                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                                        className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <input
                                        type="password"
                                        placeholder={editingUserId ? "Password (leave blank to keep)" : "Password"}
                                        required={!editingUserId}
                                        value={userFormData.password}
                                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                                        className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <select
                                        value={userFormData.role}
                                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                                        className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : editingUserId ? 'Update' : 'Add User'}
                                    </button>
                                    {editingUserId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingUserId(null);
                                                setUserFormData({ fullName: '', email: '', password: '', role: 'user' });
                                            }}
                                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </form>
                            </div>

                            {/* Users List */}
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredUsers.map(user => (
                                                <tr key={user._id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                                {user.fullName?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredUsers.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            No users found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="max-w-4xl max-h-full">
                        <img src={selectedImage} alt="Payment proof" className="max-w-full max-h-screen rounded-lg" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
