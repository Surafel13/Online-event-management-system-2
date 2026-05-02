import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

function Home() {
    const [events, setEvents] = useState([]);
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [category, setCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('latest');
    const [loading, setLoading] = useState(true);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        fetchEvents();
        window.scrollTo(0, 0);

        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [category, search, sort]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/events', { params: { category, search, sort } });
            setEvents(data);
            setFeaturedEvents(data.slice(0, 3));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="absolute inset-0" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                }}></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <span className="text-yellow-300 text-xl">✨</span>
                            <span className="text-white font-semibold">Discover & Connect</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
                            Find Your Next
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                                Amazing Experience
                            </span>
                        </h1>
                        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                            Your all-in-one platform for discovering, booking, and managing event tickets with secure payments and QR code verification.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => document.getElementById('events-section').scrollIntoView({ behavior: 'smooth' })}
                                className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            >
                                Explore Events
                            </button>

                        </div>
                    </div>
                </div>

                {/* Animated Wave */}
                <div className="relative h-16">
                    <svg className="absolute bottom-0 w-full h-16 text-gray-50" preserveAspectRatio="none" viewBox="0 0 1440 54">
                        <path fill="currentColor" d="M0 22L120 16.7C240 11 480 0 720 0C960 0 1200 11 1320 16.7L1440 22L1440 54L1320 54C1200 54 960 54 720 54C480 54 240 54 120 54L0 54Z"></path>
                    </svg>
                </div>
            </div>

            {/* Platform Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl mb-2">🎯</div>
                        <div className="text-2xl font-bold text-gray-800">Easy</div>
                        <div className="text-gray-600">Event Discovery</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl mb-2">🔒</div>
                        <div className="text-2xl font-bold text-gray-800">Secure</div>
                        <div className="text-gray-600">Payment System</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl mb-2">📱</div>
                        <div className="text-2xl font-bold text-gray-800">QR Code</div>
                        <div className="text-gray-600">Digital Tickets</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl p-6 text-center transform hover:scale-105 transition-transform duration-300">
                        <div className="text-3xl mb-2">⚡</div>
                        <div className="text-2xl font-bold text-gray-800">Real-time</div>
                        <div className="text-gray-600">Verification</div>
                    </div>
                </div>
            </div>

            {/* Events Section */}
            <div id="events-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        Upcoming Events
                    </h2>
                    <p className="text-gray-600 text-lg">Discover the most exciting events happening near you</p>
                </div>

                {/* Filters Bar */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 sticky top-4 z-20 backdrop-blur-lg bg-white/90">
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                />
                                <span className="absolute left-3 top-3 text-gray-400">🔍</span>
                            </div>
                        </div>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                        >
                            <option value="all">📚 All Categories</option>
                            <option value="Technology">💻 Technology</option>
                            <option value="Music">🎵 Music</option>
                            <option value="Business">💼 Business</option>
                            <option value="Food & Drink">🍷 Food & Drink</option>
                            <option value="Art">🎨 Art</option>
                            <option value="Health & Wellness">🧘 Health & Wellness</option>
                        </select>

                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                        >
                            <option value="latest">🕒 Latest</option>
                            <option value="date">📅 By Date</option>
                            <option value="popular">🔥 Popular</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
                        </div>
                        <p className="mt-4 text-gray-600">Loading amazing events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                        <div className="text-6xl mb-4">😢</div>
                        <p className="text-xl text-gray-600">No events found</p>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>


                        {/* Events Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {events.map((event, index) => (
                                <Link
                                    to={`/events/${event._id}`}
                                    key={event._id}
                                    className="group"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                                        {/* Image Container */}
                                        <div className="relative h-56 overflow-hidden">
                                            {event.imageUrl ? (
                                                <>
                                                    <img
                                                        src={event.imageUrl}
                                                        alt={event.title}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
                                                    <span className="text-6xl animate-bounce">{getCategoryIcon(event.category)}</span>
                                                </div>
                                            )}

                                            {/* Badge */}
                                            <div className="absolute top-4 left-4">
                                                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
                                                    <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                        {event.category}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Available Seats Badge */}
                                            <div className="absolute top-4 right-4">
                                                <div className="bg-green-500 text-white rounded-xl px-3 py-1.5 text-sm font-semibold shadow-lg">
                                                    🎫 {event.availableSeats} left
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                                {event.title}
                                            </h3>

                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {event.description}
                                            </p>

                                            <div className="space-y-2 mt-auto">
                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <span className="text-lg">📅</span>
                                                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                                    <span className="mx-1">•</span>
                                                    <span>{event.time}</span>
                                                </div>

                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <span className="text-lg">📍</span>
                                                    <span className="truncate">{event.location}</span>
                                                </div>

                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        <span>👤</span>
                                                        <span>{event.organizer}</span>
                                                    </div>
                                                    <div className="text-purple-600 font-semibold group-hover:translate-x-1 transition-transform">
                                                        Book Now →
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Newsletter Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 mt-16 py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h3 className="text-3xl font-bold text-white mb-4">Never Miss an Event</h3>
                    <p className="text-white/90 mb-8">Subscribe to get the latest updates on amazing events</p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-6 py-3 rounded-full outline-none focus:ring-2 focus:ring-yellow-300"
                        />
                        <button className="bg-yellow-400 text-purple-900 px-8 py-3 rounded-full font-semibold hover:bg-yellow-300 transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 hover:scale-110 z-50"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </button>
            )}

            {/* Add this to your global CSS or tailwind.config.js */}
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }
            `}</style>
        </div>
    );
}

export default Home;