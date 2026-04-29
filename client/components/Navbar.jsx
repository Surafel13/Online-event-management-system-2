import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Navbar({ user, setUser }) {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    return (
        <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                    >
                        <span className="text-3xl">🎉</span>
                        <span>EventHub</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/"
                            className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
                        >
                            Events
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    to="/my-tickets"
                                    className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
                                >
                                    My Tickets
                                </Link>

                                {user.role === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}

                                {/* User Dropdown */}
                                <div className="relative group">
                                    <button className="flex items-center gap-2 text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                                            {user.fullName.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{user.fullName.split(' ')[0]}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                                        <div className="py-2">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-semibold text-gray-800">{user.fullName}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-700 hover:text-purple-600 font-medium transition-colors duration-200"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-100 animate-slide-down">
                        <div className="flex flex-col gap-3">
                            <Link
                                to="/"
                                className="text-gray-700 hover:text-purple-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Events
                            </Link>

                            {user ? (
                                <>
                                    <div className="py-2 px-3">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                {user.fullName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">{user.fullName}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        to="/my-tickets"
                                        className="text-gray-700 hover:text-purple-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        My Tickets
                                    </Link>

                                    {user.role === 'admin' && (
                                        <Link
                                            to="/admin"
                                            className="text-gray-700 hover:text-purple-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}

                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="text-red-600 hover:bg-red-50 font-medium py-2 px-3 rounded-lg transition-colors text-left"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-gray-700 hover:text-purple-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>

                                    <Link
                                        to="/register"
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-3 rounded-lg font-semibold text-center hover:shadow-lg transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;