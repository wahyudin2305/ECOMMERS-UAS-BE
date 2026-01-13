import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar, { HEADER_HEIGHT_PADDING } from '../components/Navbar';
import Footer from '../components/Footer'; 
import { Mail, User, Lock, ArrowRight, CheckCircle, Loader2, RefreshCw, Music } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8888'; 

const showMessage = (message, isError = false) => {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl text-white font-semibold transition-all duration-300 z-[9999] opacity-0 ${
        isError ? 'bg-red-600' : 'bg-green-600'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = 1;
        toast.style.transform = 'translate(-50%, 0)';
    }, 50);

    setTimeout(() => {
        toast.style.opacity = 0;
        toast.style.transform = 'translate(-50%, -20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2000); 
};

// --- Login Form ---
const LoginForm = ({ setMode }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                username, 
                password
            });

            if (response.data.success) {
                const { token, user } = response.data;
                
                login(token, user); 
                showMessage('Login berhasil! 🎸', false); 
                
                if (user.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/'); 
                }
                
            } else {
                showMessage(response.data.message || 'Login gagal. Kredensial salah.', true);
            }
        } catch (error) {
            console.error('Login API Error:', error);
            const errorMessage = error.response?.data?.message || 'Login gagal. Cek koneksi server atau kredensial.';
            showMessage(errorMessage, true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-6 animate-fadeIn h-full flex flex-col justify-center py-8" onSubmit={handleLogin}>
            <div className="text-center mb-4">
                <span className="text-5xl">🎸</span>
            </div>
            <h3 className="text-4xl font-extrabold text-neutral-900 mb-2 text-center">Welcome Back!</h3>
            <p className="text-gray-500 mb-8 text-md text-center">Sign in to continue shopping for guitars.</p>

            <div className="relative">
                <User className="w-5 h-5 text-amber-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="text"
                    placeholder="Username or Email" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full p-4 pl-12 rounded-xl border border-stone-300 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 transition-all text-neutral-900 shadow-sm" 
                    disabled={isLoading}
                />
            </div>
            
            <div className="relative">
                <Lock className="w-5 h-5 text-amber-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="password"
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-4 pl-12 rounded-xl border border-stone-300 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500 transition-all text-neutral-900 shadow-sm" 
                    disabled={isLoading}
                />
            </div>

            <div className="flex justify-between items-center text-sm pt-2">
                <label className="flex items-center text-gray-600 cursor-pointer select-none">
                    <input type="checkbox" className="mr-2 h-4 w-4 text-amber-600 border-stone-300 rounded focus:ring-amber-500" />
                    Remember Me
                </label>
                <a href="#" className="font-semibold text-amber-600 hover:text-amber-800 transition-colors">Forgot Password?</a>
            </div>
            
            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/50 uppercase tracking-wider mt-8 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Sign In <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                )}
            </button>

            <p className='text-center text-sm text-gray-500 pt-6'>
                Don't have an account? 
                <button 
                    type="button" 
                    onClick={() => setMode('register')} 
                    className="text-amber-600 font-bold hover:text-amber-800 ml-1 transition-colors"
                    disabled={isLoading}
                >
                    Create one!
                </button>
            </p>
        </form>
    );
};


// --- Register Form ---
const RegisterForm = ({ setMode }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false); 

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            showMessage('Pendaftaran gagal. Konfirmasi password tidak cocok.', true);
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register`, {
                username,
                email,
                password
            });
            
            if (response.data.success) {
                showMessage(`Pendaftaran berhasil! 🎸 Silakan login.`, false);
                setMode('login'); 
            } else {
                showMessage(response.data.message || 'Pendaftaran gagal.', true);
            }
        } catch (error) {
            console.error('Register API Error:', error);
            const errorMessage = error.response?.data?.message || 'Pendaftaran gagal. Coba lagi.';
            showMessage(errorMessage, true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-5 animate-fadeIn h-full flex flex-col justify-center py-6" onSubmit={handleRegister}>
            <div className="text-center mb-2">
                <span className="text-4xl">🎸</span>
            </div>
            <h3 className="text-3xl font-extrabold text-neutral-900 mb-1 text-center">Create Account</h3>
            <p className="text-gray-500 mb-6 text-sm text-center">Join our community of guitar enthusiasts!</p>

            <div className="relative">
                <User className="w-5 h-5 text-orange-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="text"
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full p-4 pl-12 rounded-xl border border-stone-300 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-neutral-900 shadow-sm" 
                    disabled={isLoading}
                />
            </div>

            <div className="relative">
                <Mail className="w-5 h-5 text-orange-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="email"
                    placeholder="Email Address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-4 pl-12 rounded-xl border border-stone-300 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-neutral-900 shadow-sm" 
                    disabled={isLoading}
                />
            </div>

            <div className="relative">
                <Lock className="w-5 h-5 text-orange-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-4 pl-12 rounded-xl border border-stone-300 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-neutral-900 shadow-sm" 
                    disabled={isLoading}
                />
            </div>

            <div className="relative">
                <Lock className="w-5 h-5 text-orange-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full p-4 pl-12 rounded-xl border border-stone-300 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all text-neutral-900 shadow-sm" 
                    disabled={isLoading}
                />
            </div>

            <div className="flex items-center text-sm pt-2">
                <label className="flex items-start text-gray-600 cursor-pointer select-none">
                    <input type="checkbox" required className="mt-1 mr-2 h-4 w-4 text-orange-600 border-stone-300 rounded focus:ring-orange-500" />
                    I agree to the <a href="#" className="text-orange-600 hover:underline ml-1">Terms of Service</a>.
                </label>
            </div>
            
            <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-500/50 uppercase tracking-wider mt-6 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Register Now <CheckCircle className="w-5 h-5 ml-2" />
                    </>
                )}
            </button>

            <p className='text-center text-sm text-gray-500 pt-4'>
                Already have an account? 
                <button 
                    type="button" 
                    onClick={() => setMode('login')} 
                    className="text-amber-600 font-bold hover:text-amber-800 ml-1 transition-colors"
                    disabled={isLoading}
                >
                    Sign In
                </button>
            </p>
        </form>
    );
};


// --- Main Component ---
export default function LoginRegister() {
    const [mode, setMode] = useState('login'); 

    const primaryGradient = mode === 'login' 
        ? 'from-amber-500 to-orange-500' 
        : 'from-orange-500 to-red-500';

    const cardTitle = mode === 'login' ? 'GUITAR STORE' : 'JOIN US';
    const cardDescription = mode === 'login' 
        ? 'Find your perfect sound. Premium guitars from top brands worldwide.' 
        : 'Create an account and start your musical journey with us.';

    return (
        <div className="min-h-screen bg-stone-100 font-sans flex flex-col">
            <Navbar />
            
            <div className={HEADER_HEIGHT_PADDING} aria-hidden="true" />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex items-center justify-center py-20 w-full">
                
                <div 
                    className="w-full max-w-5xl h-[700px] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden lg:grid lg:grid-cols-2 relative"
                    style={{ animation: 'popIn 0.8s ease-out' }}
                >
                    
                    {/* Left Column: Form */}
                    <div className="p-8 md:p-14 flex flex-col justify-center relative overflow-y-auto">
                        <div className="lg:hidden text-center mb-6">
                            <button 
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="text-sm font-semibold flex items-center mx-auto text-amber-600 hover:underline"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Switch to {mode === 'login' ? 'Register' : 'Login'}
                            </button>
                        </div>

                        {mode === 'login' ? (
                            <LoginForm setMode={setMode} />
                        ) : (
                            <RegisterForm setMode={setMode} />
                        )}
                    </div>

                    {/* Right Column: Visual Panel */}
                    <div 
                        className={`hidden lg:flex flex-col justify-center items-center text-white p-10 transition-all duration-700 ease-in-out bg-gradient-to-br ${primaryGradient}`}
                    >
                        <div className="text-8xl mb-6 animate-bounce">🎸</div>
                        
                        <h2 className="text-4xl font-extrabold text-center mb-3">
                            {cardTitle}
                        </h2>
                        <p className="text-center text-lg max-w-xs opacity-90 mb-8">
                            {cardDescription}
                        </p>
                        
                        <div className="space-y-4 text-center">
                            <h3 className="text-sm font-medium opacity-70">
                                {mode === 'login' ? 'New to GuitarStore?' : 'Already a member?'}
                            </h3>
                            <button 
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
                                className="px-8 py-3 bg-white text-lg font-bold rounded-xl shadow-xl transition-all duration-300 hover:scale-105 text-amber-600 hover:text-amber-700"
                            >
                                {mode === 'login' ? 'Sign Up Now' : 'Sign In'}
                            </button>
                        </div>

                        {/* Features */}
                        <div className="mt-10 grid grid-cols-3 gap-4 text-center text-sm">
                            <div className="bg-white/20 rounded-xl p-3">
                                <div className="text-2xl mb-1">🎵</div>
                                <p className="text-xs">500+ Products</p>
                            </div>
                            <div className="bg-white/20 rounded-xl p-3">
                                <div className="text-2xl mb-1">🚚</div>
                                <p className="text-xs">Free Shipping</p>
                            </div>
                            <div className="bg-white/20 rounded-xl p-3">
                                <div className="text-2xl mb-1">✨</div>
                                <p className="text-xs">Original</p>
                            </div>
                        </div>
                    </div>

                </div>
                
                <style jsx="true">{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes popIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.4s ease-out;
                    }
                `}</style>
            </main>

            <Footer />
        </div>
    );
}