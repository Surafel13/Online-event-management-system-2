import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowRight, Calendar, Sparkles } from 'lucide-react';

function Login({ setUser }) {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/login', formData);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}
                    >
                        <Sparkles size={12 + Math.random() * 8} className="text-white opacity-20" />
                    </div>
                ))}
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Brand banner */}
                <div className="text-center mb-8 animate-slideDown">
                    <div className="inline-flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-lg rounded-full px-6 py-2 mb-4">
                        <Calendar className="text-white" size={20} />
                        <span className="text-white font-semibold">EventHub</span>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-blue-200">Discover and book amazing events</p>
                </div>

                {/* Main card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 animate-slideUp">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 animate-shake">
                            <div className="flex items-center space-x-2">
                                <div className="w-1 h-8 bg-red-500 rounded-full"></div>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div className="group">
                            <label className="block text-sm font-medium text-blue-200 mb-2 ml-1">
                                Email Address
                            </label>
                            <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'transform scale-[1.02]' : ''
                                }`}>
                                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-400' : 'text-blue-300'
                                    }`} size={18} />
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-blue-300/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white placeholder-blue-300/50 transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="group">
                            <label className="block text-sm font-medium text-blue-200 mb-2 ml-1">
                                Password
                            </label>
                            <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''
                                }`}>
                                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-400' : 'text-blue-300'
                                    }`} size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-blue-300/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-white placeholder-blue-300/50 transition-all duration-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 hover:text-blue-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="text-right">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-blue-300 hover:text-blue-200 transition-colors hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full group mt-6 overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 p-[2px] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="relative flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg px-4 py-3 transition-all duration-300 group-hover:from-blue-600 group-hover:to-indigo-600">
                                <span className="text-white font-bold">
                                    {loading ? 'Logging in...' : 'Login'}
                                </span>
                                {!loading && <LogIn className="text-white group-hover:translate-x-1 transition-transform" size={18} />}
                                {loading && (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                            </div>
                        </button>
                    </form>



                    {/* Register Link */}
                    <p className="text-center text-blue-200 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-white font-semibold hover:text-blue-200 transition-colors inline-flex items-center space-x-1 group">
                            <span>Create Account</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                .animate-slideDown {
                    animation: slideDown 0.6s ease-out;
                }
                
                .animate-slideUp {
                    animation: slideUp 0.6s ease-out;
                }
                
                .animate-float {
                    animation: float infinite ease-in-out;
                }
                
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
                
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}

export default Login;