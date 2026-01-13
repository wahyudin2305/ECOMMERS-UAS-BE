import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart, RefreshCw, Truck, Headset, CheckCircle, Star, ArrowRight, ChevronLeft, ChevronRight,
    Loader2, Sparkles, Clock, TrendingUp, Eye, Shield, Award, Zap, Gift, Tag,
    Package, ThumbsUp, BadgeCheck, Clock4, MessageCircle, Music, Guitar, Mic2, Speaker, Disc3, Radio
} from 'lucide-react';

import Navbar, { HEADER_HEIGHT_PADDING } from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/CartService';

// =========================================================
// CONFIGURATION
// =========================================================
const API_BASE_URL = 'http://localhost:8888';

// Placeholder image menggunakan data URI SVG (tidak perlu koneksi internet)
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect width='256' height='256' fill='%23374151'/%3E%3Ctext x='50%25' y='45%25' font-family='Arial' font-size='40' fill='%239CA3AF' text-anchor='middle'%3E🎸%3C/text%3E%3Ctext x='50%25' y='60%25' font-family='Arial' font-size='14' fill='%239CA3AF' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

const formatPriceToIDR = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

// =========================================================
// NOTIFICATION COMPONENT
// =========================================================
const CartNotification = ({ message, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => onClose(), 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const isError = message.includes("Please log in") || message.includes("Failed");
    const bgColorClass = isError 
        ? "bg-red-600 shadow-red-400/50 border-red-300" 
        : "bg-amber-600 shadow-amber-400/50 border-amber-300";

    return (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className={`flex items-center text-white text-sm font-bold px-6 py-3 rounded-full shadow-2xl space-x-3 border ${bgColorClass}`}>
                {isError ? <Shield className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                <span className="whitespace-nowrap">{message}</span>
                <button onClick={onClose} className="ml-2 text-white/80 hover:text-white font-extrabold">
                    &times;
                </button>
            </div>
        </div>
    );
};

// =========================================================
// API SERVICE
// =========================================================
const apiService = {
    getProducts: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/product/list`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            return { success: false, products: [], error: 'Network or server error' };
        }
    },
    getCategories: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/product/categories`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            return { success: false, categories: [], error: 'Network or server error' };
        }
    }
};

// =========================================================
// COLOR PALETTE - Guitar Theme (Warm colors)
// =========================================================
const guitarColorPalette = [
    { primary: 'text-amber-600', bgLight: 'bg-amber-100', bgHover: 'bg-amber-200' },
    { primary: 'text-orange-600', bgLight: 'bg-orange-100', bgHover: 'bg-orange-200' },
    { primary: 'text-yellow-600', bgLight: 'bg-yellow-100', bgHover: 'bg-yellow-200' },
    { primary: 'text-red-600', bgLight: 'bg-red-100', bgHover: 'bg-red-200' },
    { primary: 'text-stone-600', bgLight: 'bg-stone-100', bgHover: 'bg-stone-200' },
    { primary: 'text-zinc-600', bgLight: 'bg-zinc-100', bgHover: 'bg-zinc-200' },
];

// =========================================================
// KEY FEATURES - Guitar Store
// =========================================================
const keyFeatures = [
    { icon: Guitar, title: 'Original Guitars', iconColor: 'text-amber-600', colorIndex: 0 },
    { icon: Award, title: 'Certified Quality', iconColor: 'text-orange-600', colorIndex: 1 },
    { icon: Truck, title: 'Free Shipping', iconColor: 'text-yellow-600', colorIndex: 2 },
    { icon: Shield, title: 'Warranty', iconColor: 'text-red-600', colorIndex: 3 },
    { icon: RefreshCw, title: 'Easy Return', iconColor: 'text-stone-600', colorIndex: 4 },
    { icon: Headset, title: 'Expert Support', iconColor: 'text-zinc-600', colorIndex: 5 },
];

// =========================================================
// COUNTDOWN TIMER
// =========================================================
const CountdownTimer = ({ targetDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        if (difference > 0) {
            return {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return {};
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });

    const pad = (num) => (num < 10 ? `0${num}` : num);

    return (
        <div className="flex space-x-4">
            {Object.keys(timeLeft).length ? (
                Object.keys(timeLeft).map((interval) => (
                    <div key={interval} className="text-center w-16">
                        <div className="text-4xl font-black mb-1 text-white">{pad(timeLeft[interval] || 0)}</div>
                        <div className="text-amber-100 text-sm uppercase">{interval}</div>
                    </div>
                ))
            ) : (
                <span className="text-xl font-bold text-white">Sale Ended!</span>
            )}
        </div>
    );
};

// =========================================================
// PROMO CARD
// =========================================================
const PromoCard = ({ title, subtitle, discount, color, icon: Icon }) => (
    <div className={`bg-gradient-to-br ${color} p-8 rounded-3xl text-white shadow-2xl hover:shadow-amber-300/30 transition-all duration-500 hover:scale-105 group overflow-hidden relative h-48 flex flex-col justify-between`}>
        <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
            <Icon className="w-16 h-16" />
        </div>
        <div>
            <h3 className="text-2xl font-black mb-2">{title}</h3>
            <p className="text-white/80 text-sm">{subtitle}</p>
        </div>
        <div className="flex justify-between items-end">
            <span className="text-4xl font-black">{discount}</span>
            <button className="bg-white text-neutral-900 font-bold py-2 px-4 rounded-2xl text-sm hover:bg-gray-100 transition-colors">
                Shop Now
            </button>
        </div>
    </div>
);

// =========================================================
// MINIMAL FEATURE CARD
// =========================================================
const MinimalFeatureCard = ({ title, icon: Icon, iconColor, colorIndex }) => {
    const { bgLight } = guitarColorPalette[colorIndex % guitarColorPalette.length];

    return (
        <div className="bg-white p-4 rounded-2xl shadow-md border border-stone-200 transition-all duration-300 hover:shadow-amber-200/50 hover:bg-stone-50 group text-center cursor-pointer">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-shadow ${bgLight}`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <h4 className="text-sm font-bold text-gray-800">{title}</h4>
        </div>
    );
};

// =========================================================
// MINI PROMO BANNER
// =========================================================
const MiniPromoBanner = ({ title, subtitle, cta, bgClass }) => (
    <div className={`bg-gradient-to-br ${bgClass} rounded-3xl p-6 shadow-xl hover:shadow-amber-300/30 transition-all duration-500 group cursor-pointer text-white`}>
        <div className="flex justify-between items-center">
            <div>
                <h4 className="font-black text-white text-lg mb-1">{title}</h4>
                <p className="text-white/80 text-sm">{subtitle}</p>
            </div>
            <button className="bg-white text-neutral-900 font-bold py-2 px-4 rounded-2xl text-sm hover:bg-gray-100 transition-colors group-hover:scale-105">
                {cta}
            </button>
        </div>
    </div>
);

// =========================================================
// PRODUCT CARD - Guitar Theme
// =========================================================
const ProductCard = ({ product, showNewBadge = false, onProductClick, onAddToCart }) => {
    const idrPrice = formatPriceToIDR(product.price);
    const isNewProduct = showNewBadge && product.created_at &&
        (new Date() - new Date(product.created_at)) < (7 * 24 * 60 * 60 * 1000);
    const hasDiscount = product.price % 3 !== 0;
    const discountPercent = Math.round(Math.random() * 20 + 10);

    const productImageUrl = (product.image && product.image.startsWith('/'))
        ? `${API_BASE_URL}${product.image}`
        : PLACEHOLDER_IMAGE;

    return (
        <div
            className="bg-white p-4 rounded-3xl transition-all duration-500 shadow-xl hover:shadow-amber-200/50 hover:scale-105 border border-stone-200 relative overflow-hidden group cursor-pointer"
            onClick={() => onProductClick(product.id)}
        >
            {isNewProduct && (
                <div className="absolute top-4 left-4 z-20">
                    <span className="bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-2xl flex items-center shadow-lg">
                        <Sparkles className="w-3 h-3 mr-1" /> NEW
                    </span>
                </div>
            )}
            {hasDiscount && (
                <div className="absolute top-4 right-4 z-20">
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-2xl shadow-lg">
                        -{discountPercent}%
                    </span>
                </div>
            )}

            {/* Image Container */}
            <div className="bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl mb-4 flex items-center justify-center h-64 relative overflow-hidden border border-stone-200">
                <img
                    src={productImageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER_IMAGE; }}
                />

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center space-x-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <button
                        className="p-3 bg-white rounded-2xl text-gray-700 hover:text-amber-600 shadow-lg transition-all hover:scale-110"
                        onClick={(e) => { e.stopPropagation(); onProductClick(product.id); }}
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                    <button
                        className="p-3 bg-amber-600 rounded-2xl text-white hover:bg-amber-700 shadow-lg transition-all hover:scale-110"
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    {product.category_name || 'GUITAR'}
                </p>
                <h3 className="text-lg font-black text-gray-900 line-clamp-2 leading-tight group-hover:text-amber-700 transition-colors">
                    {product.name}
                </h3>
                <div className="flex items-center space-x-2">
                    <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                    </div>
                    <span className="text-sm text-gray-500">({Math.floor(Math.random() * 50) + 10})</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col space-y-1">
                        <span className="text-xl font-black text-amber-600">{idrPrice}</span>
                        {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through font-medium">
                                {formatPriceToIDR(product.price * (1 + discountPercent / 100))}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// =========================================================
// CATEGORY SLIDER
// =========================================================
const CategorySlider = ({ categories }) => {
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth / 2;
            const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
            scrollContainerRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
            setTimeout(updateArrowVisibility, 300);
        }
    };

    const updateArrowVisibility = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
        }
    }, []);

    useEffect(() => {
        updateArrowVisibility();
        const currentRef = scrollContainerRef.current;
        if (currentRef) currentRef.addEventListener('scroll', updateArrowVisibility);
        window.addEventListener('resize', updateArrowVisibility);
        return () => {
            window.removeEventListener('resize', updateArrowVisibility);
            if (currentRef) currentRef.removeEventListener('scroll', updateArrowVisibility);
        };
    }, [categories, updateArrowVisibility]);

    return (
        <section className="my-20 relative">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">🎸 Shop by Category</h2>
                    <p className="text-md text-gray-600">Find the perfect instrument for your style</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => scroll('left')}
                        className={`p-3 rounded-xl transition-all duration-300 ${showLeftArrow
                            ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        disabled={!showLeftArrow}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className={`p-3 rounded-xl transition-all duration-300 ${showRightArrow
                            ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-lg'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                        disabled={!showRightArrow}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex space-x-4 overflow-x-scroll scroll-smooth py-4 px-2 -mx-2 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {categories.map((category, index) => {
                    const colorIndex = index % guitarColorPalette.length;
                    const primaryColor = guitarColorPalette[colorIndex].primary;

                    return (
                        <div
                            key={category.id}
                            className="flex-shrink-0 w-full xs:w-[calc((100%-1rem*1)/2)] sm:w-[calc((100%-1rem*2)/3)] md:w-[calc((100%-1rem*3)/4)] lg:w-[calc((100%-1rem*5)/6)] group cursor-pointer snap-start"
                        >
                            <div className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg border border-stone-200 transition-all duration-500 hover:scale-105 hover:border-amber-300 h-64 flex flex-col justify-center items-center">
                                <div className="relative mb-4">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center p-2 group-hover:from-amber-200 group-hover:to-orange-200 transition-all duration-500 overflow-hidden">
                                        {category.image ? (
                                            <img
                                                src={`${API_BASE_URL}${category.image}`}
                                                alt={category.name}
                                                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center">
                                                <Music className={`w-6 h-6 ${primaryColor}`} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                                        {Math.floor(Math.random() * 30) + 5} Items
                                    </div>
                                </div>

                                <div className="text-center pt-2">
                                    <h3 className="text-lg font-black text-gray-900 mb-2 group-hover:text-amber-700 transition-colors line-clamp-1">
                                        {category.name}
                                    </h3>
                                    <button className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center justify-center space-x-1 mx-auto bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100">
                                        <span>Explore</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

// =========================================================
// USER FEEDBACK CARD
// =========================================================
const UserFeedbackCard = ({ name, review, colorIndex }) => {
    const { primary, bgLight } = guitarColorPalette[colorIndex % guitarColorPalette.length];

    return (
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-xl hover:shadow-amber-200/50 transition-all duration-500">
            <div className="flex text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-400" />)}
            </div>
            <p className="text-gray-700 text-base italic mb-6">"{review}"</p>
            <div className="flex items-center">
                <div className={`${bgLight} w-12 h-12 rounded-full flex items-center justify-center mr-4`}>
                    <span className={`${primary} font-bold`}>{name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                    <p className="text-base font-black text-gray-900">{name}</p>
                    <p className={`text-sm ${primary}`}>Verified Buyer</p>
                </div>
            </div>
        </div>
    );
};

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function Home() {
    const { isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notification, setNotification] = useState({ isVisible: false, message: '' });

    const navigate = useNavigate();
    const targetSaleDate = useRef(new Date(Date.now() + 24 * 60 * 60 * 1000)).current;

    const closeNotification = useCallback(() => {
        setNotification({ isVisible: false, message: '' });
    }, []);

    const handleProductClick = useCallback((productId) => {
        navigate(`/product/${productId}`);
    }, [navigate]);

    const handleShopNowClick = useCallback(() => {
        navigate('/shop');
    }, [navigate]);

    const handleAddToCart = useCallback(async (product) => {
        if (!isAuthenticated) {
            setNotification({
                isVisible: true,
                message: "Please log in first to add items to your cart."
            });
            setTimeout(() => navigate('/login'), 1000);
            return;
        }

        if (!product || !product.id) return;

        try {
            const token = localStorage.getItem('authToken');
            const response = await cartService.addToCart(product.id, 1, token);

            setNotification({
                isVisible: true,
                message: response.message || `${product.name} added to cart! 🎸`
            });

            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            console.error('Error adding to cart:', err);
            setNotification({
                isVisible: true,
                message: err.message || 'Failed to add item to cart.'
            });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError('');

                const [productsResponse, categoriesResponse] = await Promise.all([
                    apiService.getProducts(),
                    apiService.getCategories()
                ]);

                if (productsResponse.success) {
                    setProducts(productsResponse.products);
                } else if (productsResponse.error) {
                    setError(`Products: ${productsResponse.error}`);
                }

                if (categoriesResponse.success) {
                    setCategories(categoriesResponse.categories);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                setError('Error connecting to server.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 font-sans">
                <Navbar />
                <div className={HEADER_HEIGHT_PADDING} />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="flex flex-col justify-center items-center h-64 bg-white rounded-3xl shadow-xl">
                        <Loader2 className="w-12 h-12 animate-spin text-amber-600 mb-4" />
                        <p className="text-xl font-black text-amber-600">Loading Guitar Collection...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const newArrivals = [...products]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8);

    const customerReviews = [
        { name: "Rizky Pratama", review: "Gitar Fender yang saya beli kualitasnya luar biasa! Suara bersih dan sustain panjang. Pengiriman juga cepat dan aman." },
        { name: "Dian Saputra", review: "Pelayanan sangat memuaskan. Staff membantu saya memilih gitar yang cocok untuk pemula. Highly recommended!" },
        { name: "Ahmad Fadillah", review: "Harga kompetitif dan produk original. Sudah 3 kali beli di sini dan selalu puas. Terima kasih!" },
    ];

    return (
        <div className="min-h-screen bg-stone-50 font-sans">
            <Navbar />

            <CartNotification
                message={notification.message}
                isVisible={notification.isVisible}
                onClose={closeNotification}
            />

            <div className={HEADER_HEIGHT_PADDING} aria-hidden="true" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {error && (
                    <div className="my-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">{error}</span>
                            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900 font-bold">✕</button>
                        </div>
                    </div>
                )}

                {/* ==================== HERO SECTION - Text Only ==================== */}
                <section className="py-16 text-center">
                    <div className="bg-gradient-to-br from-neutral-900 via-stone-900 to-neutral-800 rounded-3xl p-12 md:p-16 shadow-2xl relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-10 left-10 text-8xl">🎸</div>
                            <div className="absolute bottom-10 right-10 text-8xl">🎵</div>
                            <div className="absolute top-1/2 left-1/4 text-6xl">🎼</div>
                        </div>

                        <div className="relative z-10">
                            <span className="inline-block bg-amber-500 text-white text-sm font-bold px-4 py-2 rounded-full mb-6">
                                🎸 #1 Guitar Store in Indonesia
                            </span>

                            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                                Find Your <span className="text-amber-400">Perfect Sound</span>
                            </h1>

                            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                                Koleksi gitar terlengkap dari brand ternama dunia. 
                                Acoustic, Electric, Bass, dan aksesoris berkualitas dengan harga terbaik.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={handleShopNowClick}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-amber-500/30 flex items-center justify-center"
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    Shop Now
                                </button>
                                <button
                                    onClick={handleShopNowClick}
                                    className="bg-transparent hover:bg-white/10 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 border-2 border-white/30 flex items-center justify-center"
                                >
                                    View Collection
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </button>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
                                <div>
                                    <div className="text-3xl font-black text-amber-400">500+</div>
                                    <div className="text-gray-400 text-sm">Products</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-amber-400">10K+</div>
                                    <div className="text-gray-400 text-sm">Happy Customers</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-amber-400">50+</div>
                                    <div className="text-gray-400 text-sm">Top Brands</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================== KEY FEATURES ==================== */}
                <section className="my-16">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {keyFeatures.map((feature, index) => (
                            <MinimalFeatureCard
                                key={index}
                                title={feature.title}
                                icon={feature.icon}
                                iconColor={feature.iconColor}
                                colorIndex={feature.colorIndex}
                            />
                        ))}
                    </div>
                </section>

                {/* ==================== PROMO CARDS ==================== */}
                <section className="my-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <PromoCard
                            title="Acoustic Sale"
                            subtitle="Gitar akustik premium"
                            discount="30% OFF"
                            color="from-amber-500 to-orange-500"
                            icon={Music}
                        />
                        <PromoCard
                            title="Electric Deals"
                            subtitle="Electric guitar & amp"
                            discount="25% OFF"
                            color="from-red-500 to-rose-500"
                            icon={Zap}
                        />
                        <PromoCard
                            title="Accessories"
                            subtitle="Strings, picks, & more"
                            discount="40% OFF"
                            color="from-stone-600 to-zinc-600"
                            icon={Gift}
                        />
                    </div>
                </section>

                {/* ==================== CATEGORY SLIDER ==================== */}
                {categories.length > 0 && <CategorySlider categories={categories} />}

                {/* ==================== NEW ARRIVALS ==================== */}
                <section className="my-20">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <div className="flex items-center space-x-3 mb-3">
                                <Clock className="w-8 h-8 text-amber-600" />
                                <h2 className="text-4xl font-black text-gray-900">New Arrivals</h2>
                            </div>
                            <p className="text-lg text-gray-600">Fresh guitars just added to our collection</p>
                        </div>
                        <a href="/shop" className="text-base font-semibold text-amber-600 hover:text-amber-800 flex items-center bg-amber-50 px-6 py-3 rounded-2xl hover:bg-amber-100">
                            View All <ArrowRight className="w-5 h-5 ml-2" />
                        </a>
                    </div>

                    {newArrivals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {newArrivals.map((product, index) => (
                                <ProductCard
                                    key={product.id || index}
                                    product={product}
                                    showNewBadge={true}
                                    onProductClick={handleProductClick}
                                    onAddToCart={handleAddToCart}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-3xl shadow-xl border border-stone-200">
                            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Yet</h3>
                            <p className="text-gray-600">Check back soon for new guitars!</p>
                        </div>
                    )}
                </section>

                {/* ==================== MEGA SALE BANNER ==================== */}
                <section className="my-20">
                    <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-12 rounded-3xl shadow-2xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <div className="max-w-lg text-center md:text-left mb-8 md:mb-0">
                                    <h2 className="text-4xl font-black mb-4">🎸 MEGA GUITAR SALE!</h2>
                                    <p className="text-amber-100 text-lg mb-6">
                                        Diskon besar-besaran untuk semua jenis gitar. 
                                        Jangan lewatkan kesempatan ini!
                                    </p>
                                    <button 
                                        onClick={handleShopNowClick}
                                        className="bg-white text-amber-600 font-bold py-3 px-8 rounded-2xl hover:bg-gray-100 transition-colors shadow-lg"
                                    >
                                        Shop The Sale
                                    </button>
                                </div>
                                <div className="text-center">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                                        <p className="text-amber-100 mb-2 font-semibold">Sale Ends In:</p>
                                        <CountdownTimer targetDate={targetSaleDate} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================== MINI PROMO STRIP ==================== */}
                <section className="my-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MiniPromoBanner
                            title="Free Shipping"
                            subtitle="Gratis ongkir seluruh Indonesia"
                            cta="Learn More"
                            bgClass="from-stone-700 to-stone-800"
                        />
                        <MiniPromoBanner
                            title="Member Rewards"
                            subtitle="Dapatkan poin setiap pembelian"
                            cta="Join Now"
                            bgClass="from-amber-600 to-orange-600"
                        />
                    </div>
                </section>

                {/* ==================== TRUST BADGES ==================== */}
                <section className="my-16">
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Why Choose Us?</h3>
                            <p className="text-gray-600">Trusted by thousands of musicians</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { icon: BadgeCheck, text: "100% Original" },
                                { icon: Shield, text: "Secure Payment" },
                                { icon: Clock4, text: "Fast Delivery" },
                                { icon: MessageCircle, text: "Expert Support" }
                            ].map((item, index) => (
                                <div key={index} className="text-center">
                                    <div className="bg-amber-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                        <item.icon className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div className="text-sm font-medium text-gray-700">{item.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ==================== CUSTOMER REVIEWS ==================== */}
                <section className="my-20">
                    <h2 className="text-3xl font-black text-gray-900 mb-10 text-center">
                        ⭐ What Our Customers Say
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {customerReviews.map((review, index) => (
                            <UserFeedbackCard
                                key={index}
                                name={review.name}
                                review={review.review}
                                colorIndex={index}
                            />
                        ))}
                    </div>
                </section>

                {/* ==================== FINAL CTA ==================== */}
                <section className="my-20">
                    <div className="bg-neutral-900 rounded-3xl p-12 text-white text-center shadow-2xl">
                        <h2 className="text-4xl font-black mb-4">🎸 Ready to Rock?</h2>
                        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                            Temukan gitar impianmu sekarang. Koleksi lengkap, harga terbaik, dan pelayanan profesional.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleShopNowClick}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-2xl transition-colors shadow-lg hover:shadow-amber-500/30"
                            >
                                Start Shopping
                            </button>
                            <button className="bg-transparent hover:bg-white/10 text-white font-bold py-3 px-8 rounded-2xl transition-colors border border-white/50">
                                Contact Us
                            </button>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}