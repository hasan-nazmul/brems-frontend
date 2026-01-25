import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { FaTrain, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/login', { email, password });
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            const role = response.data.user.role;
            navigate(role === 'verified_user' ? '/portal' : '/dashboard');
        } catch (err) {
            setError('Invalid credentials. Please check your email and password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans text-gray-900">
            
            {/* --- LEFT SIDE: BRANDING (Desktop Only) --- */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#006A4E] flex-col justify-center items-center text-white p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                
                <div className="relative z-10 text-center max-w-lg">
                    <div className="bg-white/10 p-6 rounded-full inline-block mb-8 backdrop-blur-md border border-white/20 shadow-2xl">
                        <FaTrain className="text-7xl drop-shadow-lg" />
                    </div>
                    <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">
                        BANGLADESH <br/> RAILWAY
                    </h1>
                    <p className="text-lg text-green-100 uppercase tracking-[0.2em] font-medium border-t border-green-400/30 pt-4 mt-4 inline-block">
                        Employee Management System
                    </p>
                </div>
                
                <div className="absolute bottom-8 text-[10px] text-green-200/60 uppercase tracking-widest">
                    Government of the People's Republic of Bangladesh
                </div>
            </div>

            {/* --- RIGHT SIDE: LOGIN FORM --- */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gray-50 lg:bg-white">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl lg:shadow-none">
                    
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="inline-block p-4 bg-[#006A4E]/10 rounded-full mb-3">
                            <FaTrain className="text-4xl text-[#006A4E]" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide">Railway ERP</h2>
                    </div>

                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
                        <p className="text-gray-500 mt-2 text-sm">Welcome back! Please enter your official credentials.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-[#F42A41] text-sm font-medium p-4 rounded-lg border-l-4 border-[#F42A41] mb-6 animate-fade-in flex items-center">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        
                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Email Address</label>
                            <div className="relative w-full text-gray-500 focus-within:text-[#006A4E]">
                                {/* ICON LEFT: Placed absolutely on the left */}
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-gray-400 text-lg group-focus-within:text-[#006A4E] transition-colors" />
                                </div>
                                {/* INPUT: Added pl-11 to push text to the right of the icon */}
                                <input 
                                    type="email" 
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] outline-none transition-all bg-gray-50 focus:bg-white text-gray-900"
                                    placeholder="name@railway.gov.bd"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-2 ml-1">Password</label>
                            <div className="relative group">
                                
                                {/* INPUT: pl-11 for Lock icon, pr-11 for Eye icon */}
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] outline-none transition-all bg-gray-50 focus:bg-white text-gray-900"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />

                                {/* ICON RIGHT: Eye Toggle */}
                                <button 
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer z-10 outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-2">
                                <button type="button" className="text-xs font-bold text-[#006A4E] hover:underline">
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-[#006A4E] hover:bg-[#047857] text-white font-bold py-3.5 rounded-lg transition-all duration-200 shadow-lg shadow-green-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                    Authenticating...
                                </>
                            ) : (
                                'Access Portal'
                            )}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-xs text-gray-400">
                            Authorized Personnel Only. <br/>
                            © 2026 Bangladesh Railway.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;